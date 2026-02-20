package br.com.semear.web.rest;

import br.com.semear.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller para servir avatares de usuários.
 */
@RestController
@RequestMapping("/api/avatars")
public class AvatarResource {

    private static final Logger LOG = LoggerFactory.getLogger(AvatarResource.class);

    private final UserService userService;

    public AvatarResource(UserService userService) {
        this.userService = userService;
    }

    /**
     * {@code GET  /avatars/:userId} : obtém o avatar de um usuário por ID.
     *
     * @param userId o ID do usuário.
     * @return os bytes da imagem ou 404 se não encontrado.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<byte[]> getAvatar(@PathVariable Long userId) {
        return userService
            .getAvatarBytesByUserId(userId)
            .map(bytes -> ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(bytes))
            .orElse(ResponseEntity.notFound().build());
    }
}
