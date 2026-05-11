using UsuariosApi.Models.Dtos;

namespace UsuariosApi.Services;

public sealed record ResultadoCriacaoUsuario(UsuarioResponseDto? Usuario, string? MensagemErro);

public sealed class ResultadoAtualizacaoUsuario
{
    public bool Sucesso { get; private init; }

    public bool NaoEncontrado { get; private init; }

    public string? MensagemErro { get; private init; }

    public static ResultadoAtualizacaoUsuario Ok() =>
        new() { Sucesso = true };

    public static ResultadoAtualizacaoUsuario NaoEncontradoResult() =>
        new() { NaoEncontrado = true };

    public static ResultadoAtualizacaoUsuario ErroNegocio(string mensagem) =>
        new() { MensagemErro = mensagem };
}
