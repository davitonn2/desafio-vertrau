using System.ComponentModel.DataAnnotations;
using UsuariosApi.Models;

namespace UsuariosApi.Models.Dtos;

public class UsuarioUpdateDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O sobrenome é obrigatório.")]
    public string Sobrenome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "O gênero é obrigatório.")]
    public Genero Genero { get; set; }

    public DateTime? DataNascimento { get; set; }

    public EnderecoInputDto? Endereco { get; set; }
}
