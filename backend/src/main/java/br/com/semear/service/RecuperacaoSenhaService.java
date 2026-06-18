package br.com.semear.service;

import br.com.semear.domain.RecuperacaoSenha;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.CanalRecuperacaoSenha;
import br.com.semear.repository.RecuperacaoSenhaRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.RecuperacaoSenhaConcluirDTO;
import br.com.semear.service.dto.RecuperacaoSenhaIniciarDTO;
import br.com.semear.service.dto.RecuperacaoSenhaOpcoesDTO;
import br.com.semear.service.dto.RecuperacaoSenhaRespostaDTO;
import br.com.semear.service.dto.RecuperacaoSenhaValidarDTO;
import br.com.semear.service.exception.EmailEnvioException;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import br.com.semear.web.rest.vm.ManagedUserVM;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RecuperacaoSenhaService {

    private static final Logger LOG = LoggerFactory.getLogger(RecuperacaoSenhaService.class);
    private static final String ENTITY = "recuperacaoSenha";
    private static final int CODIGO_TAMANHO = 6;
    private static final int EXPIRACAO_MINUTOS = 15;
    private static final int MAX_TENTATIVAS = 5;
    private static final int MAX_SOLICITACOES_POR_HORA = 3;

    private final UserRepository userRepository;
    private final RecuperacaoSenhaRepository recuperacaoSenhaRepository;
    private final MailService mailService;
    private final SmsService smsService;
    private final UserService userService;

    public RecuperacaoSenhaService(
        UserRepository userRepository,
        RecuperacaoSenhaRepository recuperacaoSenhaRepository,
        MailService mailService,
        SmsService smsService,
        UserService userService
    ) {
        this.userRepository = userRepository;
        this.recuperacaoSenhaRepository = recuperacaoSenhaRepository;
        this.mailService = mailService;
        this.smsService = smsService;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public RecuperacaoSenhaOpcoesDTO consultarOpcoes(String cpfBruto) {
        RecuperacaoSenhaOpcoesDTO resposta = opcoesGenericas();
        String cpf = normalizarCpf(cpfBruto);
        if (cpf == null || cpf.length() != 11) {
            return resposta;
        }

        Optional<User> userOpt = userRepository.findOneByLogin(cpf).filter(User::isActivated);
        if (userOpt.isEmpty()) {
            LOG.debug("Consulta de opções de recuperação para CPF não encontrado ou inativo");
            return resposta;
        }

        return montarOpcoes(userOpt.get());
    }

    public RecuperacaoSenhaRespostaDTO iniciar(RecuperacaoSenhaIniciarDTO dto) {
        RecuperacaoSenhaRespostaDTO resposta = respostaGenerica();
        String cpf = normalizarCpf(dto.getCpf());
        if (cpf == null || cpf.length() != 11) {
            return resposta;
        }

        Optional<User> userOpt = userRepository.findOneByLogin(cpf).filter(User::isActivated);
        if (userOpt.isEmpty()) {
            LOG.debug("Recuperação de senha solicitada para CPF não encontrado ou inativo");
            return resposta;
        }

        User user = userOpt.get();
        if (recuperacaoSenhaRepository.countByUserAndCriadoEmAfter(user, Instant.now().minus(1, ChronoUnit.HOURS)) >= MAX_SOLICITACOES_POR_HORA) {
            LOG.warn("Limite de solicitações de recuperação excedido para user {}", user.getLogin());
            return resposta;
        }

        RecuperacaoSenhaOpcoesDTO opcoes = montarOpcoes(user);
        if (!opcoes.isPodeRecuperar()) {
            LOG.warn("Usuário {} sem canal disponível para recuperação", user.getLogin());
            return resposta;
        }

        CanalRecuperacaoSenha canal;
        try {
            canal = resolverCanalEscolhido(opcoes, dto.getCanal());
        } catch (BadRequestAlertException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            LOG.warn("Canal inválido na recuperação para user {}: {}", user.getLogin(), e.getMessage());
            return resposta;
        }

        invalidarCodigosPendentes(user);

        String codigo = gerarCodigo();
        RecuperacaoSenha registro = new RecuperacaoSenha();
        registro.setUser(user);
        registro.setCodigo(codigo);
        registro.setCanal(canal);
        registro.setUsado(false);
        registro.setTentativas(0);
        registro.setCriadoEm(Instant.now());
        registro.setExpiraEm(Instant.now().plus(EXPIRACAO_MINUTOS, ChronoUnit.MINUTES));
        recuperacaoSenhaRepository.save(registro);

        try {
            enviarCodigo(user, canal, codigo);
        } catch (EmailEnvioException e) {
            LOG.warn("Falha ao enviar e-mail de recuperação para user {}: {}", user.getLogin(), e.getMessage());
            recuperacaoSenhaRepository.delete(registro);
            return respostaFalhaEnvio(e.getMessage());
        } catch (IllegalStateException e) {
            LOG.warn("Falha ao enviar SMS de recuperação para user {}: {}", user.getLogin(), e.getMessage());
            recuperacaoSenhaRepository.delete(registro);
            return respostaFalhaEnvio(
                "Não foi possível enviar o SMS agora. Tente receber o código por e-mail ou contate a secretaria da igreja."
            );
        } catch (Exception e) {
            LOG.warn("Falha ao enviar código de recuperação para user {}", user.getLogin(), e);
            recuperacaoSenhaRepository.delete(registro);
            return respostaFalhaEnvio("Não foi possível enviar o código. Tente novamente em instantes.");
        }

        resposta.setCodigoEnviado(true);
        resposta.setCanal(canal);
        resposta.setDestinoMascarado(mascararDestino(user, canal));
        resposta.setMensagem(
            canal == CanalRecuperacaoSenha.EMAIL
                ? "Enviamos um código para o seu e-mail cadastrado."
                : "Enviamos um código por SMS para o seu celular cadastrado."
        );
        return resposta;
    }

    @Transactional(readOnly = true)
    public RecuperacaoSenhaRespostaDTO validar(RecuperacaoSenhaValidarDTO dto) {
        RecuperacaoSenhaRespostaDTO resposta = new RecuperacaoSenhaRespostaDTO();
        Optional<RecuperacaoSenha> registroOpt = buscarRegistroAtivo(dto.getCpf(), dto.getCodigo());
        if (registroOpt.isEmpty()) {
            resposta.setMensagem("Código inválido ou expirado.");
            resposta.setCodigoEnviado(false);
            return resposta;
        }
        resposta.setMensagem("Código válido. Defina sua nova senha.");
        resposta.setCodigoEnviado(true);
        return resposta;
    }

    public RecuperacaoSenhaRespostaDTO concluir(RecuperacaoSenhaConcluirDTO dto) {
        if (isPasswordLengthInvalid(dto.getNovaSenha())) {
            throw new BadRequestAlertException("A senha deve ter entre 8 e 100 caracteres", ENTITY, "senhainvalida");
        }

        RecuperacaoSenha registro = buscarRegistroAtivo(dto.getCpf(), dto.getCodigo()).orElseThrow(() ->
            new BadRequestAlertException("Código inválido ou expirado", ENTITY, "codigoinvalido")
        );

        User user = registro.getUser();
        userService.definirSenhaPorLogin(user.getLogin(), dto.getNovaSenha());

        registro.setUsado(true);
        recuperacaoSenhaRepository.save(registro);
        invalidarCodigosPendentes(user);

        RecuperacaoSenhaRespostaDTO resposta = new RecuperacaoSenhaRespostaDTO();
        resposta.setCodigoEnviado(true);
        resposta.setMensagem("Senha alterada com sucesso! Você já pode fazer login.");
        LOG.debug("Senha redefinida via recuperação para user {}", user.getLogin());
        return resposta;
    }

    private Optional<RecuperacaoSenha> buscarRegistroAtivo(String cpfBruto, String codigoBruto) {
        String cpf = normalizarCpf(cpfBruto);
        String codigo = normalizarCodigo(codigoBruto);
        if (cpf == null || codigo == null) {
            return Optional.empty();
        }

        Optional<User> userOpt = userRepository.findOneByLogin(cpf);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        Optional<RecuperacaoSenha> registroOpt = recuperacaoSenhaRepository.findFirstByUserAndUsadoIsFalseAndExpiraEmAfterOrderByCriadoEmDesc(
            userOpt.get(),
            Instant.now()
        );

        if (registroOpt.isEmpty()) {
            return Optional.empty();
        }

        RecuperacaoSenha registro = registroOpt.get();
        if (registro.getTentativas() >= MAX_TENTATIVAS) {
            return Optional.empty();
        }

        if (!registro.getCodigo().equals(codigo)) {
            registro.setTentativas(registro.getTentativas() + 1);
            recuperacaoSenhaRepository.save(registro);
            return Optional.empty();
        }

        return Optional.of(registro);
    }

    private void enviarCodigo(User user, CanalRecuperacaoSenha canal, String codigo) {
        if (canal == CanalRecuperacaoSenha.EMAIL) {
            mailService.sendCodigoRecuperacaoEmailSync(user.getEmail(), codigo);
            return;
        }
        String telefone = StringUtils.firstNonBlank(user.getPhone(), user.getPhoneSecondary());
        smsService.enviarCodigoRecuperacao(telefone, codigo);
    }

    private RecuperacaoSenhaOpcoesDTO montarOpcoes(User user) {
        RecuperacaoSenhaOpcoesDTO opcoes = new RecuperacaoSenhaOpcoesDTO();
        boolean temEmail = StringUtils.isNotBlank(user.getEmail());
        boolean temTelefone = StringUtils.isNotBlank(user.getPhone()) || StringUtils.isNotBlank(user.getPhoneSecondary());
        boolean emailDisponivel = temEmail && mailService.isEnvioDisponivel();
        boolean smsDisponivel = temTelefone && smsService.isDisponivel();

        opcoes.setEmailDisponivel(emailDisponivel);
        opcoes.setSmsDisponivel(smsDisponivel);
        opcoes.setEscolhaNecessaria(temEmail && temTelefone);

        if (temEmail) {
            opcoes.setEmailMascarado(mascararEmail(user.getEmail()));
        }
        if (temTelefone) {
            opcoes.setTelefoneMascarado(mascararTelefone(StringUtils.firstNonBlank(user.getPhone(), user.getPhoneSecondary())));
        }

        if (!emailDisponivel && !smsDisponivel) {
            opcoes.setPodeRecuperar(false);
            if (temEmail && !mailService.isEnvioDisponivel() && temTelefone && !smsService.isDisponivel()) {
                opcoes.setMensagem(
                    "O envio de e-mail e SMS não está disponível no momento. Peça à secretaria da igreja para redefinir sua senha."
                );
            } else if (temEmail && !mailService.isEnvioDisponivel()) {
                opcoes.setMensagem(
                    "Seu cadastro possui e-mail, mas o envio não está configurado no servidor. " +
                    "Peça à secretaria da igreja para cadastrar seu celular ou redefinir sua senha."
                );
            } else if (temTelefone && !smsService.isDisponivel()) {
                opcoes.setMensagem(
                    "Seu cadastro possui celular, mas o envio por SMS não está disponível no momento. " +
                    "Peça à secretaria da igreja para cadastrar ou atualizar seu e-mail."
                );
            } else {
                opcoes.setMensagem(
                    "Seu cadastro não possui e-mail nem celular para recuperação. " +
                    "Procure a secretaria da igreja para atualizar seus dados."
                );
            }
            return opcoes;
        }

        opcoes.setPodeRecuperar(true);
        if (opcoes.isEscolhaNecessaria()) {
            if (emailDisponivel && smsDisponivel) {
                opcoes.setMensagem("Escolha como deseja receber o código de verificação.");
            } else if (emailDisponivel) {
                opcoes.setMensagem(
                    "Seu cadastro possui e-mail e celular. O envio por SMS não está disponível no momento — use o e-mail."
                );
            } else {
                opcoes.setMensagem(
                    "Seu cadastro possui e-mail e celular. O envio por e-mail não está disponível no momento — use o SMS."
                );
            }
        } else if (emailDisponivel) {
            opcoes.setMensagem("Enviaremos o código para o e-mail " + opcoes.getEmailMascarado() + ".");
        } else {
            opcoes.setMensagem("Enviaremos o código por SMS para o celular " + opcoes.getTelefoneMascarado() + ".");
        }
        return opcoes;
    }

    private CanalRecuperacaoSenha resolverCanalEscolhido(RecuperacaoSenhaOpcoesDTO opcoes, CanalRecuperacaoSenha canalSolicitado) {
        if (opcoes.isEscolhaNecessaria()) {
            if (canalSolicitado == null) {
                throw new BadRequestAlertException("Escolha e-mail ou SMS para receber o código", ENTITY, "canalobrigatorio");
            }
            if (canalSolicitado == CanalRecuperacaoSenha.EMAIL && !opcoes.isEmailDisponivel()) {
                throw new BadRequestAlertException("E-mail não disponível para recuperação", ENTITY, "canalinvalido");
            }
            if (canalSolicitado == CanalRecuperacaoSenha.SMS && !opcoes.isSmsDisponivel()) {
                throw new BadRequestAlertException("SMS não disponível para recuperação", ENTITY, "canalinvalido");
            }
            return canalSolicitado;
        }

        if (opcoes.isEmailDisponivel()) {
            return CanalRecuperacaoSenha.EMAIL;
        }
        if (opcoes.isSmsDisponivel()) {
            return CanalRecuperacaoSenha.SMS;
        }
        throw new IllegalArgumentException("Nenhum canal disponível");
    }

    private RecuperacaoSenhaRespostaDTO respostaFalhaEnvio(String mensagem) {
        RecuperacaoSenhaRespostaDTO resposta = new RecuperacaoSenhaRespostaDTO();
        resposta.setMensagem(mensagem);
        resposta.setCodigoEnviado(false);
        return resposta;
    }

    private RecuperacaoSenhaOpcoesDTO opcoesGenericas() {
        RecuperacaoSenhaOpcoesDTO resposta = new RecuperacaoSenhaOpcoesDTO();
        resposta.setMensagem(
            "Se o CPF estiver cadastrado e possuir e-mail ou celular, você poderá receber um código de verificação."
        );
        resposta.setPodeRecuperar(false);
        return resposta;
    }

    private RecuperacaoSenhaRespostaDTO respostaGenerica() {
        RecuperacaoSenhaRespostaDTO resposta = new RecuperacaoSenhaRespostaDTO();
        resposta.setMensagem(
            "Se o CPF estiver cadastrado e possuir e-mail ou celular, você receberá um código em instantes."
        );
        resposta.setCodigoEnviado(false);
        return resposta;
    }

    private void invalidarCodigosPendentes(User user) {
        recuperacaoSenhaRepository.findAllByUserAndUsadoIsFalse(user).forEach(r -> {
            r.setUsado(true);
            recuperacaoSenhaRepository.save(r);
        });
    }

    private String gerarCodigo() {
        SecureRandom random = new SecureRandom();
        int numero = random.nextInt(1_000_000);
        return String.format("%0" + CODIGO_TAMANHO + "d", numero);
    }

    private String normalizarCpf(String cpf) {
        if (cpf == null) {
            return null;
        }
        return cpf.replaceAll("\\D", "");
    }

    private String normalizarCodigo(String codigo) {
        if (codigo == null) {
            return null;
        }
        String digits = codigo.replaceAll("\\D", "");
        return digits.length() == CODIGO_TAMANHO ? digits : null;
    }

    private String mascararDestino(User user, CanalRecuperacaoSenha canal) {
        if (canal == CanalRecuperacaoSenha.EMAIL) {
            return mascararEmail(user.getEmail());
        }
        return mascararTelefone(StringUtils.firstNonBlank(user.getPhone(), user.getPhoneSecondary()));
    }

    private String mascararEmail(String email) {
        if (StringUtils.isBlank(email) || !email.contains("@")) {
            return "***";
        }
        String[] partes = email.split("@", 2);
        String local = partes[0];
        String dominio = partes[1];
        String prefixo = local.length() <= 1 ? "*" : local.charAt(0) + "***";
        return prefixo + "@" + dominio;
    }

    private String mascararTelefone(String telefone) {
        String digits = telefone.replaceAll("\\D", "");
        if (digits.length() < 4) {
            return "(**) *****-****";
        }
        return "(**) *****-" + digits.substring(digits.length() - 4);
    }

    private boolean isPasswordLengthInvalid(String password) {
        return (
            StringUtils.isEmpty(password) ||
            password.length() < ManagedUserVM.PASSWORD_MIN_LENGTH ||
            password.length() > ManagedUserVM.PASSWORD_MAX_LENGTH
        );
    }
}
