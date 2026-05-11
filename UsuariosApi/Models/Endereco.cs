namespace UsuariosApi.Models;

public class Endereco
{
    public long Id { get; set; }

    public long UsuarioId { get; set; }

    public Usuario Usuario { get; set; } = null!;

    public string Cep { get; set; } = string.Empty;

    public string Estado { get; set; } = string.Empty;

    public string Rua { get; set; } = string.Empty;

    public string Bairro { get; set; } = string.Empty;

    public int Numero { get; set; }

    public string? Complemento { get; set; }
}
