import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <a routerLink="/" class="brand" routerLinkActive="brand--active" [routerLinkActiveOptions]="{ exact: true }">
          Usuários
        </a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="nav__link--active" [routerLinkActiveOptions]="{ exact: true }" class="nav__link">
            Cadastro
          </a>
          <a routerLink="/lista" routerLinkActive="nav__link--active" class="nav__link"> Ver cadastros </a>
        </nav>
      </header>
      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .app-shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .app-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.85rem 1.5rem;
        background: rgba(255, 252, 247, 0.88);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--app-border);
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .brand {
        font-weight: 700;
        font-size: 1.05rem;
        letter-spacing: -0.03em;
        color: var(--app-text);
        text-decoration: none;
      }
      .brand--active {
        color: var(--app-accent);
      }
      .nav {
        display: flex;
        gap: 0.35rem;
      }
      .nav__link {
        padding: 0.45rem 0.9rem;
        border-radius: 999px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--app-muted);
        text-decoration: none;
        transition:
          color 0.15s ease,
          background 0.15s ease;
      }
      .nav__link:hover {
        color: var(--app-text);
        background: rgba(42, 38, 34, 0.06);
      }
      .nav__link--active {
        color: var(--app-accent-contrast);
        background: var(--app-accent);
      }
      .app-main {
        flex: 1;
      }
    `,
  ],
})
export class AppComponent {}
