using System.ComponentModel.DataAnnotations;

namespace UsuariosApi.Models.Dtos;

public class EnderecoInputDto
{
    [Required]
    public string Cep { get; set; } = string.Empty;

    [Required]
    public string Estado { get; set; } = string.Empty;

    [Required]
    public string Rua { get; set; } = string.Empty;

    [Required]
    public string Bairro { get; set; } = string.Empty;

    [Required]
    public int Numero { get; set; }

    public string? Complemento { get; set; }
}

public class EnderecoResponseDto
{
    public string Cep { get; set; } = string.Empty;

    public string Estado { get; set; } = string.Empty;

    public string Rua { get; set; } = string.Empty;

    public string Bairro { get; set; } = string.Empty;

    public int Numero { get; set; }

    public string? Complemento { get; set; }
}
