using UsuariosApi.Models;
using UsuariosApi.Models.Dtos;
using UsuariosApi.Repositories;

namespace UsuariosApi.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarios;

    public UsuarioService(IUsuarioRepository usuarios)
    {
        _usuarios = usuarios;
    }

    public async Task<ListaUsuariosPaginadaDto> ListarAsync(
        int pagina,
        int tamanhoPagina,
        UsuarioListagemFiltro? filtro,
        CancellationToken cancellationToken)
    {
        var (itens, total) = await _usuarios.ObterPaginadosAsync(
            pagina,
            tamanhoPagina,
            filtro,
            cancellationToken);

        var totalPaginas = tamanhoPagina > 0
            ? (int)Math.Ceiling(total / (double)tamanhoPagina)
            : 0;

        var dtos = itens.Select(UsuarioMapping.ParaResposta).ToList();

        return new ListaUsuariosPaginadaDto
        {
            Itens = dtos,
            Pagina = pagina,
            TamanhoPagina = tamanhoPagina,
            TotalItens = total,
            TotalPaginas = totalPaginas
        };
    }

    public async Task<UsuarioResponseDto?> ObterPorIdAsync(long id, CancellationToken cancellationToken)
    {
        var usuario = await _usuarios.ObterPorIdComEnderecoAsync(id, somenteLeitura: true, cancellationToken);
        return usuario is null ? null : UsuarioMapping.ParaResposta(usuario);
    }

    public async Task<ResultadoCriacaoUsuario> CriarAsync(
        UsuarioCreateDto dto,
        CancellationToken cancellationToken)
    {
        var email = NormalizarEmail(dto.Email);

        if (await _usuarios.EmailJaCadastradoAsync(email, ignorarUsuarioId: null, cancellationToken))
        {
            return new ResultadoCriacaoUsuario(null, "Já existe um usuário cadastrado com este e-mail.");
        }

        if (!DataNascimentoPermitida(dto.DataNascimento))
        {
            return new ResultadoCriacaoUsuario(null, "A data de nascimento não pode ser futura.");
        }

        var usuario = new Usuario
        {
            Nome = dto.Nome.Trim(),
            Sobrenome = dto.Sobrenome.Trim(),
            Email = email,
            Genero = dto.Genero,
            DataNascimento = dto.DataNascimento
        };

        if (dto.Endereco is not null)
        {
            usuario.Endereco = UsuarioMapping.NovoEndereco(dto.Endereco);
        }

        await _usuarios.AdicionarAsync(usuario, cancellationToken);

        var criado = await _usuarios.ObterPorIdComEnderecoAsync(usuario.Id, somenteLeitura: true, cancellationToken)
                     ?? usuario;

        return new ResultadoCriacaoUsuario(UsuarioMapping.ParaResposta(criado), null);
    }

    public async Task<ResultadoAtualizacaoUsuario> AtualizarAsync(
        long id,
        UsuarioUpdateDto dto,
        CancellationToken cancellationToken)
    {
        var usuario = await _usuarios.ObterPorIdComEnderecoAsync(id, somenteLeitura: false, cancellationToken);

        if (usuario is null)
        {
            return ResultadoAtualizacaoUsuario.NaoEncontradoResult();
        }

        var email = NormalizarEmail(dto.Email);

        if (await _usuarios.EmailJaCadastradoAsync(email, ignorarUsuarioId: id, cancellationToken))
        {
            return ResultadoAtualizacaoUsuario.ErroNegocio("Já existe um usuário cadastrado com este e-mail.");
        }

        if (!DataNascimentoPermitida(dto.DataNascimento))
        {
            return ResultadoAtualizacaoUsuario.ErroNegocio("A data de nascimento não pode ser futura.");
        }

        usuario.Nome = dto.Nome.Trim();
        usuario.Sobrenome = dto.Sobrenome.Trim();
        usuario.Email = email;
        usuario.Genero = dto.Genero;
        usuario.DataNascimento = dto.DataNascimento;

        if (dto.Endereco is null)
        {
            if (usuario.Endereco is not null)
            {
                var removido = usuario.Endereco;
                usuario.Endereco = null;
                _usuarios.RemoverEndereco(removido);
            }
        }
        else if (usuario.Endereco is null)
        {
            usuario.Endereco = UsuarioMapping.NovoEndereco(dto.Endereco);
        }
        else
        {
            UsuarioMapping.Aplicar(usuario.Endereco, dto.Endereco);
        }

        await _usuarios.SalvarAlteracoesAsync(cancellationToken);

        return ResultadoAtualizacaoUsuario.Ok();
    }

    public Task<bool> RemoverAsync(long id, CancellationToken cancellationToken)
    {
        return _usuarios.RemoverAsync(id, cancellationToken);
    }

    private static string NormalizarEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static bool DataNascimentoPermitida(DateTime? dataNascimento)
    {
        if (!dataNascimento.HasValue)
        {
            return true;
        }

        return dataNascimento.Value.Date <= DateTime.Today;
    }
}
