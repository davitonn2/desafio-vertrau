using Microsoft.AspNetCore.Mvc;
using UsuariosApi.Models;
using UsuariosApi.Models.Dtos;
using UsuariosApi.Services;

namespace UsuariosApi.Controllers;

[ApiController]
[Route("usuarios")]
public class UsuariosController : ControllerBase
{
    private const int TamanhoPaginaMaximo = 100;

    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    /// <summary>Listar usuários com filtros opcionais e paginação.</summary>
    /// <param name="nome">Filtra por trecho em nome ou sobrenome (sem diferenciar maiúsculas).</param>
    /// <param name="email">Filtra por trecho no e-mail (sem diferenciar maiúsculas).</param>
    /// <param name="genero">Filtra por gênero exato (Masculino, Feminino, Outro).</param>
    [HttpGet]
    [ProducesResponseType(typeof(ListaUsuariosPaginadaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ListaUsuariosPaginadaDto>> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 10,
        [FromQuery] string? nome = null,
        [FromQuery] string? email = null,
        [FromQuery] Genero? genero = null,
        CancellationToken cancellationToken = default)
    {
        if (pagina < 1 || tamanhoPagina < 1 || tamanhoPagina > TamanhoPaginaMaximo)
        {
            return BadRequest(new
            {
                mensagem = "Informe pagina >= 1 e tamanhoPagina entre 1 e " + TamanhoPaginaMaximo + "."
            });
        }

        UsuarioListagemFiltro? filtro = null;
        if (!string.IsNullOrWhiteSpace(nome) || !string.IsNullOrWhiteSpace(email) || genero.HasValue)
        {
            filtro = new UsuarioListagemFiltro
            {
                Nome = string.IsNullOrWhiteSpace(nome) ? null : nome,
                Email = string.IsNullOrWhiteSpace(email) ? null : email,
                Genero = genero
            };
        }

        var resultado = await _usuarioService.ListarAsync(pagina, tamanhoPagina, filtro, cancellationToken);
        return Ok(resultado);
    }

    /// <summary>Obter usuário por ID.</summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UsuarioResponseDto>> ObterPorId(
        long id,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioService.ObterPorIdAsync(id, cancellationToken);
        if (usuario is null)
        {
            return NotFound();
        }

        return Ok(usuario);
    }

    /// <summary>Criar usuário.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UsuarioResponseDto>> Criar(
        [FromBody] UsuarioCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var resultado = await _usuarioService.CriarAsync(dto, cancellationToken);

        if (resultado.MensagemErro is not null)
        {
            return BadRequest(new { mensagem = resultado.MensagemErro });
        }

        return CreatedAtAction(nameof(ObterPorId), new { id = resultado.Usuario!.Id }, resultado.Usuario);
    }

    /// <summary>Atualizar usuário.</summary>
    [HttpPut("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Atualizar(
        long id,
        [FromBody] UsuarioUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var resultado = await _usuarioService.AtualizarAsync(id, dto, cancellationToken);

        if (resultado.NaoEncontrado)
        {
            return NotFound();
        }

        if (resultado.MensagemErro is not null)
        {
            return BadRequest(new { mensagem = resultado.MensagemErro });
        }

        return NoContent();
    }

    /// <summary>Remover usuário.</summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remover(long id, CancellationToken cancellationToken = default)
    {
        var removido = await _usuarioService.RemoverAsync(id, cancellationToken);

        if (!removido)
        {
            return NotFound();
        }

        return NoContent();
    }
}
