using Moq;
using UsuariosApi.Models;
using UsuariosApi.Models.Dtos;
using UsuariosApi.Repositories;
using UsuariosApi.Services;

namespace UsuariosApi.Tests;

public class UsuarioServiceTests
{
    [Fact]
    public async Task CriarAsync_quando_email_duplicado_retorna_mensagem()
    {
        var repo = new Mock<IUsuarioRepository>();
        repo
            .Setup(r => r.EmailJaCadastradoAsync("a@b.com", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var sut = new UsuarioService(repo.Object);
        var dto = new UsuarioCreateDto
        {
            Nome = "A",
            Sobrenome = "B",
            Email = "a@b.com",
            Genero = Genero.Outro,
        };

        var r = await sut.CriarAsync(dto, CancellationToken.None);

        Assert.Null(r.Usuario);
        Assert.Equal("Já existe um usuário cadastrado com este e-mail.", r.MensagemErro);
        repo.Verify(
            x => x.AdicionarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CriarAsync_quando_data_nascimento_futura_retorna_mensagem()
    {
        var repo = new Mock<IUsuarioRepository>();
        repo
            .Setup(r => r.EmailJaCadastradoAsync(It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var sut = new UsuarioService(repo.Object);
        var dto = new UsuarioCreateDto
        {
            Nome = "A",
            Sobrenome = "B",
            Email = "novo@b.com",
            Genero = Genero.Masculino,
            DataNascimento = DateTime.Today.AddDays(1),
        };

        var r = await sut.CriarAsync(dto, CancellationToken.None);

        Assert.Null(r.Usuario);
        Assert.Equal("A data de nascimento não pode ser futura.", r.MensagemErro);
    }
}
