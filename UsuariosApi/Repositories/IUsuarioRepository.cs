using UsuariosApi.Models;
using UsuariosApi.Models.Dtos;

namespace UsuariosApi.Repositories;

public interface IUsuarioRepository
{
    Task<(IReadOnlyList<Usuario> Itens, int Total)> ObterPaginadosAsync(
        int pagina,
        int tamanhoPagina,
        UsuarioListagemFiltro? filtro,
        CancellationToken cancellationToken);

    Task<Usuario?> ObterPorIdComEnderecoAsync(
        long id,
        bool somenteLeitura,
        CancellationToken cancellationToken);

    Task<bool> EmailJaCadastradoAsync(
        string email,
        long? ignorarUsuarioId,
        CancellationToken cancellationToken);

    Task AdicionarAsync(Usuario usuario, CancellationToken cancellationToken);

    Task<bool> RemoverAsync(long id, CancellationToken cancellationToken);

    void RemoverEndereco(Endereco endereco);

    Task SalvarAlteracoesAsync(CancellationToken cancellationToken);
}
