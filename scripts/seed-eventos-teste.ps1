# Seed de eventos de teste via API (perfil dev - igreja Semear)
$base = "http://localhost:8080/api"
$marcador = "[EVT] Semear"

function Get-AuthToken($login, $senha) {
    $body = @{ username = $login; password = $senha; rememberMe = $true } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$base/authenticate" -Method POST -ContentType "application/json" -Body $body
    return $resp.id_token
}

function Invoke-Api($method, $path, $token, $body = $null) {
    $headers = @{ Authorization = "Bearer $token" }
    $params = @{
        Uri         = "$base$path"
        Method      = $method
        Headers     = $headers
        ContentType = "application/json"
    }
    if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 6) }
    return Invoke-RestMethod @params
}

Write-Host "Autenticando como admin igreja Semear..."
$tokenAdmin = Get-AuthToken "12111111111" "semear121"

$existentes = @(Invoke-Api GET "/eventos" $tokenAdmin)
$jaTem = $existentes | Where-Object { $_.titulo -like "$marcador*" }
if ($jaTem.Count -gt 0) {
    Write-Host "Eventos de teste $marcador ja existem ($($jaTem.Count)). Pulando criacao."
} else {
    Write-Host "Criando eventos de teste..."
    $agora = Get-Date
    $eventos = @(
        @{
            titulo = "$marcador - Culto dominical"
            descricao = "Culto de adoracao e pregacao."
            dataInicio = ($agora.AddDays(3).Date.AddHours(9).AddMinutes(30)).ToUniversalTime().ToString("o")
            dataFim = ($agora.AddDays(3).Date.AddHours(11).AddMinutes(30)).ToUniversalTime().ToString("o")
            local = "Templo principal"
            publico = "INTERNO"
            inscricoesAbertas = $true
            capacidade = 200
            categoria = "CULTO"
            status = "PUBLICADO"
            imagemUrl = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800"
        },
        @{
            titulo = "$marcador - EBD"
            descricao = "Escola Biblica Dominical."
            dataInicio = ($agora.AddDays(5).Date.AddHours(8)).ToUniversalTime().ToString("o")
            dataFim = ($agora.AddDays(5).Date.AddHours(10)).ToUniversalTime().ToString("o")
            local = "Salao de aulas"
            publico = "INTERNO"
            inscricoesAbertas = $true
            capacidade = 60
            categoria = "EBD"
            status = "PUBLICADO"
        },
        @{
            titulo = "$marcador - Encontro de jovens"
            descricao = "Louvor, palavra e comunhao."
            dataInicio = ($agora.AddDays(7).Date.AddHours(19).AddMinutes(30)).ToUniversalTime().ToString("o")
            local = "Salao jovens"
            publico = "INTERNO"
            inscricoesAbertas = $true
            capacidade = 40
            categoria = "JOVENS"
            status = "PUBLICADO"
            linkExterno = "https://forms.gle/exemplo-inscricao-jovens"
        },
        @{
            titulo = "$marcador - Encontro de casais"
            descricao = "Noite especial para casais."
            dataInicio = ($agora.AddDays(10).Date.AddHours(18)).ToUniversalTime().ToString("o")
            local = "Salao social"
            publico = "INTERNO"
            inscricoesAbertas = $true
            capacidade = 30
            categoria = "CASAIS"
            status = "PUBLICADO"
            prazoCancelamentoInscricao = ($agora.AddDays(8).Date.AddHours(23).AddMinutes(59)).ToUniversalTime().ToString("o")
        },
        @{
            titulo = "$marcador - Conferencia aberta"
            descricao = "Evento publico no site da igreja."
            dataInicio = ($agora.AddDays(14).Date.AddHours(19)).ToUniversalTime().ToString("o")
            local = "Auditorio"
            publico = "PUBLICO"
            inscricoesAbertas = $false
            categoria = "TREINAMENTO"
            status = "PUBLICADO"
            imagemUrl = "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800"
            linkExterno = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        @{
            titulo = "$marcador - Rascunho interno"
            descricao = "Evento ainda nao publicado."
            dataInicio = ($agora.AddDays(20).Date.AddHours(10)).ToUniversalTime().ToString("o")
            local = "Sala de reunioes"
            publico = "INTERNO"
            inscricoesAbertas = $false
            capacidade = 20
            categoria = "OUTRO"
            status = "RASCUNHO"
        },
        @{
            titulo = "$marcador - Retiro encerrado"
            descricao = "Evento passado para aba Passados."
            dataInicio = ($agora.AddDays(-5).Date.AddHours(19)).ToUniversalTime().ToString("o")
            local = "Chacara"
            publico = "INTERNO"
            inscricoesAbertas = $false
            capacidade = 50
            categoria = "TREINAMENTO"
            status = "ENCERRADO"
        },
        @{
            titulo = "$marcador - Vigilia de oracao"
            descricao = "Evento amanha para testar lembrete."
            dataInicio = ($agora.AddDays(1).Date.AddHours(19)).ToUniversalTime().ToString("o")
            local = "Templo"
            publico = "INTERNO"
            inscricoesAbertas = $true
            capacidade = 100
            categoria = "CULTO"
            status = "PUBLICADO"
        }
    )

    foreach ($ev in $eventos) {
        Invoke-Api POST "/eventos" $tokenAdmin $ev | Out-Null
        Write-Host "  + $($ev.titulo)"
    }
}

Write-Host "Inscrevendo membros de teste..."
$membros = @(
    @{ login = "66666666666"; senha = "semear666" },
    @{ login = "77777777777"; senha = "semear777" },
    @{ login = "66666666661"; senha = "semear661" },
    @{ login = "77777777771"; senha = "semear771" },
    @{ login = "55555555555"; senha = "semear555" }
)

$eventosAtivos = @(Invoke-Api GET "/eventos/proximos" $tokenAdmin | Where-Object { $_.titulo -like "$marcador*" -and $_.inscricoesAbertas -eq $true })

foreach ($m in $membros) {
    try {
        $token = Get-AuthToken $m.login $m.senha
        $idx = 0
        foreach ($ev in $eventosAtivos) {
            if ($idx -ge 3) { break }
            try {
                Invoke-Api POST "/eventos/$($ev.id)/inscrever" $token $null | Out-Null
                Write-Host "  $($m.login) inscrito em $($ev.titulo)"
                $idx++
            } catch {
                # ja inscrito ou indisponivel
            }
        }
    } catch {
        Write-Host "  Falha login $($m.login): $_"
    }
}

Write-Host "Concluido! Acesse /eventos com usuarios da igreja Semear."
