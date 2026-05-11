using UsuariosApi.Models;

namespace UsuariosApi.Models.Dtos;

/// <summary>Filtros opcionais para listagem paginada de usuários.</summary>
public sealed class UsuarioListagemFiltro
{
    public string? Nome { get; init; }

    public string? Email { get; init; }

    public Genero? Genero { get; init; }
}
