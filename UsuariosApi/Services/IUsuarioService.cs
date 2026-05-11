using UsuariosApi.Models.Dtos;

namespace UsuariosApi.Services;

public interface IUsuarioService
{
    Task<ListaUsuariosPaginadaDto> ListarAsync(
        int pagina,
        int tamanhoPagina,
        UsuarioListagemFiltro? filtro,
        CancellationToken cancellationToken);

    Task<UsuarioResponseDto?> ObterPorIdAsync(long id, CancellationToken cancellationToken);

    Task<ResultadoCriacaoUsuario> CriarAsync(
        UsuarioCreateDto dto,
        CancellationToken cancellationToken);

    Task<ResultadoAtualizacaoUsuario> AtualizarAsync(
        long id,
        UsuarioUpdateDto dto,
        CancellationToken cancellationToken);

    Task<bool> RemoverAsync(long id, CancellationToken cancellationToken);
}
