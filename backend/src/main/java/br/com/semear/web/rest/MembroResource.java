package br.com.semear.web.rest;

import br.com.semear.domain.User;
import br.com.semear.repository.UserRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/membros")
public class MembroResource {

    private static final Logger LOG = LoggerFactory.getLogger(MembroResource.class);

    private final UserRepository userRepository;

    public MembroResource(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public record AniversarianteVM(Long id, String name, LocalDate birthDate, String imageUrl) {}

    @GetMapping("/aniversariantes")
    public List<AniversarianteVM> listarAniversariantes(@RequestParam(name = "days", required = false, defaultValue = "7") int days) {
        int janela = Math.max(1, Math.min(days, 60));
        LOG.debug("REST request to get upcoming birthdays (days={})", janela);

        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(janela);

        return userRepository.findAllByBirthDateIsNotNullAndActivatedIsTrue().stream()
            .map(u -> new Object[] { u, proximoAniversario(hoje, u.getBirthDate()) })
            .filter(arr -> arr[1] != null)
            .filter(arr -> {
                LocalDate prox = (LocalDate) arr[1];
                return (!prox.isBefore(hoje)) && (!prox.isAfter(limite));
            })
            .sorted(Comparator.comparing(arr -> (LocalDate) arr[1]))
            .limit(20)
            .map(arr -> {
                User u = (User) arr[0];
                LocalDate prox = (LocalDate) arr[1];
                String name = montarNome(u);
                return new AniversarianteVM(u.getId(), name, prox, u.getImageUrl());
            })
            .collect(Collectors.toList());
    }

    private static String montarNome(User u) {
        String first = u.getFirstName();
        String last = u.getLastName();
        String full = (Objects.toString(first, "") + " " + Objects.toString(last, "")).trim();
        return full.isBlank() ? u.getLogin() : full;
    }

    private static LocalDate proximoAniversario(LocalDate hoje, LocalDate birthDate) {
        if (birthDate == null) return null;
        LocalDate thisYear = LocalDate.of(hoje.getYear(), birthDate.getMonth(), birthDate.getDayOfMonth());
        if (!thisYear.isBefore(hoje)) return thisYear;
        return thisYear.plusYears(1);
    }
}

