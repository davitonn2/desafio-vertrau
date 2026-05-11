namespace UsuariosApi.Models.Dtos;

public sealed class ListaUsuariosPaginadaDto
{
    public required IReadOnlyList<UsuarioResponseDto> Itens { get; init; }

    public int Pagina { get; init; }

    public int TamanhoPagina { get; init; }

    public int TotalItens { get; init; }

    public int TotalPaginas { get; init; }
}
