using UsuariosApi.Models;
using UsuariosApi.Models.Dtos;

namespace UsuariosApi.Services;

internal static class UsuarioMapping
{
    public static UsuarioResponseDto ParaResposta(Usuario usuario)
    {
        return new UsuarioResponseDto
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Sobrenome = usuario.Sobrenome,
            Email = usuario.Email,
            Genero = usuario.Genero,
            DataNascimento = usuario.DataNascimento,
            Endereco = usuario.Endereco is null ? null : ParaResposta(usuario.Endereco)
        };
    }

    private static EnderecoResponseDto ParaResposta(Endereco endereco)
    {
        return new EnderecoResponseDto
        {
            Cep = endereco.Cep,
            Estado = endereco.Estado,
            Rua = endereco.Rua,
            Bairro = endereco.Bairro,
            Numero = endereco.Numero,
            Complemento = endereco.Complemento
        };
    }

    public static Endereco NovoEndereco(EnderecoInputDto dto)
    {
        return new Endereco
        {
            Cep = dto.Cep.Trim(),
            Estado = dto.Estado.Trim(),
            Rua = dto.Rua.Trim(),
            Bairro = dto.Bairro.Trim(),
            Numero = dto.Numero,
            Complemento = string.IsNullOrWhiteSpace(dto.Complemento) ? null : dto.Complemento.Trim()
        };
    }

    public static void Aplicar(Endereco destino, EnderecoInputDto origem)
    {
        destino.Cep = origem.Cep.Trim();
        destino.Estado = origem.Estado.Trim();
        destino.Rua = origem.Rua.Trim();
        destino.Bairro = origem.Bairro.Trim();
        destino.Numero = origem.Numero;
        destino.Complemento = string.IsNullOrWhiteSpace(origem.Complemento)
            ? null
            : origem.Complemento.Trim();
    }
}
