package br.com.semear.service;

import br.com.semear.domain.DepartamentoMembro;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.Sexo;
import br.com.semear.domain.enumeration.StatusInscricaoEvento;
import br.com.semear.domain.enumeration.TipoAudienciaNotificacao;
import br.com.semear.repository.DepartamentoMembroRepository;
import br.com.semear.repository.EventoInscricaoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.ConfigNotificacaoDTO;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NotificacaoAudienciaService {

    private final UserRepository userRepository;
    private final DepartamentoMembroRepository departamentoMembroRepository;
    private final EventoInscricaoRepository eventoInscricaoRepository;

    public NotificacaoAudienciaService(
        UserRepository userRepository,
        DepartamentoMembroRepository departamentoMembroRepository,
        EventoInscricaoRepository eventoInscricaoRepository
    ) {
        this.userRepository = userRepository;
        this.departamentoMembroRepository = departamentoMembroRepository;
        this.eventoInscricaoRepository = eventoInscricaoRepository;
    }

    public List<User> resolverDestinatarios(Long igrejaId, ConfigNotificacaoDTO config, Long eventoId) {
        if (config == null || !config.isEfetivamenteAtivo()) {
            return List.of();
        }
        TipoAudienciaNotificacao audiencia = config.getAudiencia() != null
            ? config.getAudiencia()
            : TipoAudienciaNotificacao.TODOS;

        List<User> base = switch (audiencia) {
            case TODOS -> userRepository.findAllByIgrejaIdAndActivatedIsTrue(igrejaId);
            case INSCRITOS -> resolverInscritos(eventoId);
            case DEPARTAMENTOS -> resolverDepartamentos(config.getDepartamentoIds());
            case HOMENS -> filtrarPorSexo(userRepository.findAllByIgrejaIdAndActivatedIsTrue(igrejaId), Sexo.MASCULINO);
            case MULHERES -> filtrarPorSexo(userRepository.findAllByIgrejaIdAndActivatedIsTrue(igrejaId), Sexo.FEMININO);
        };

        return deduplicar(base);
    }

    private List<User> resolverInscritos(Long eventoId) {
        if (eventoId == null) {
            return List.of();
        }
        return eventoInscricaoRepository.findByEventoIdAndStatus(eventoId, StatusInscricaoEvento.ATIVA).stream()
            .map(i -> i.getUser())
            .filter(u -> u != null && u.isActivated())
            .toList();
    }

    private List<User> resolverDepartamentos(List<Long> departamentoIds) {
        if (departamentoIds == null || departamentoIds.isEmpty()) {
            return List.of();
        }
        Map<Long, User> unicos = new LinkedHashMap<>();
        for (Long deptId : departamentoIds) {
            if (deptId == null) continue;
            for (DepartamentoMembro membro : departamentoMembroRepository.findByDepartamentoId(deptId)) {
                User user = membro.getUser();
                if (user != null && user.isActivated() && user.getId() != null) {
                    unicos.put(user.getId(), user);
                }
            }
        }
        return new ArrayList<>(unicos.values());
    }

    private List<User> filtrarPorSexo(List<User> usuarios, Sexo sexo) {
        return usuarios.stream().filter(u -> u.getSexo() == sexo).toList();
    }

    private List<User> deduplicar(List<User> usuarios) {
        Map<Long, User> map = new LinkedHashMap<>();
        for (User u : usuarios) {
            if (u != null && u.getId() != null) {
                map.put(u.getId(), u);
            }
        }
        return new ArrayList<>(map.values());
    }
}
