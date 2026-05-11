using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using UsuariosApi.Models.Dtos;

namespace UsuariosApi.Tests;

public class UsuariosApiIntegrationTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() },
    };

    [Fact]
    public async Task Get_usuarios_com_filtro_nome_retorna_cadastro()
    {
        using var factory = new ApiWebApplicationFactory();
        var client = factory.CreateClient();

        var criar = new
        {
            nome = "FiltroNome",
            sobrenome = "Teste",
            email = "filtro.integration@test.local",
            genero = "Feminino",
            dataNascimento = (string?)null,
            endereco = (object?)null,
        };

        var post = await client.PostAsJsonAsync("/usuarios", criar);
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);

        var list = await client.GetAsync("/usuarios?nome=FiltroNome&pagina=1&tamanhoPagina=10");
        list.EnsureSuccessStatusCode();
        var body = await list.Content.ReadFromJsonAsync<ListaUsuariosPaginadaDto>(JsonOptions);
        Assert.NotNull(body);
        Assert.Single(body.Itens);
        Assert.Equal("FiltroNome", body.Itens[0].Nome);
    }

    [Fact]
    public async Task Delete_usuarios_id_retorna_204()
    {
        using var factory = new ApiWebApplicationFactory();
        var client = factory.CreateClient();

        var criar = new
        {
            nome = "Del",
            sobrenome = "User",
            email = "delete.integration@test.local",
            genero = "Outro",
        };

        var post = await client.PostAsJsonAsync("/usuarios", criar);
        post.EnsureSuccessStatusCode();
        var criado = await post.Content.ReadFromJsonAsync<UsuarioResponseDto>(JsonOptions);
        Assert.NotNull(criado);

        var del = await client.DeleteAsync($"/usuarios/{criado.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        var get = await client.GetAsync($"/usuarios/{criado.Id}");
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
    }
}
