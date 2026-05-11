using Microsoft.EntityFrameworkCore;
using UsuariosApi.Data;
using UsuariosApi.Models;
using UsuariosApi.Models.Dtos;

namespace UsuariosApi.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Usuario> Itens, int Total)> ObterPaginadosAsync(
        int pagina,
        int tamanhoPagina,
        UsuarioListagemFiltro? filtro,
        CancellationToken cancellationToken)
    {
        var query = AplicarFiltro(
            _context.Usuarios.AsNoTracking().Include(u => u.Endereco),
            filtro);

        var total = await query.CountAsync(cancellationToken);

        var itens = await query
            .OrderBy(u => u.Id)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(cancellationToken);

        return (itens, total);
    }

    private static IQueryable<Usuario> AplicarFiltro(
        IQueryable<Usuario> query,
        UsuarioListagemFiltro? filtro)
    {
        if (filtro is null)
        {
            return query;
        }

        if (!string.IsNullOrWhiteSpace(filtro.Nome))
        {
            var termo = filtro.Nome.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Nome.ToLower().Contains(termo) ||
                u.Sobrenome.ToLower().Contains(termo));
        }

        if (!string.IsNullOrWhiteSpace(filtro.Email))
        {
            var termo = filtro.Email.Trim().ToLowerInvariant();
            query = query.Where(u => u.Email.ToLower().Contains(termo));
        }

        if (filtro.Genero.HasValue)
        {
            query = query.Where(u => u.Genero == filtro.Genero.Value);
        }

        return query;
    }

    public async Task<Usuario?> ObterPorIdComEnderecoAsync(
        long id,
        bool somenteLeitura,
        CancellationToken cancellationToken)
    {
        var query = _context.Usuarios
            .Include(u => u.Endereco)
            .Where(u => u.Id == id);

        if (somenteLeitura)
        {
            query = query.AsNoTracking();
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public Task<bool> EmailJaCadastradoAsync(
        string email,
        long? ignorarUsuarioId,
        CancellationToken cancellationToken)
    {
        var emailNormalizado = email.Trim().ToUpperInvariant();

        var query = _context.Usuarios.AsNoTracking()
            .Where(u => u.Email.ToUpper() == emailNormalizado);

        if (ignorarUsuarioId.HasValue)
        {
            query = query.Where(u => u.Id != ignorarUsuarioId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task AdicionarAsync(Usuario usuario, CancellationToken cancellationToken)
    {
        await _context.Usuarios.AddAsync(usuario, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> RemoverAsync(long id, CancellationToken cancellationToken)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Endereco)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (usuario is null)
        {
            return false;
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public void RemoverEndereco(Endereco endereco)
    {
        _context.Enderecos.Remove(endereco);
    }

    public Task SalvarAlteracoesAsync(CancellationToken cancellationToken)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}
