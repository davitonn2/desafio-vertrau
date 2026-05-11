import { Routes } from '@angular/router';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { EditarUsuarioComponent } from './pages/editar-usuario/editar-usuario.component';
import { ListaUsuariosComponent } from './pages/lista-usuarios/lista-usuarios.component';

export const routes: Routes = [
  { path: '', component: CadastroComponent },
  { path: 'lista', component: ListaUsuariosComponent },
  { path: 'usuarios/:id/editar', component: EditarUsuarioComponent },
  { path: '**', redirectTo: '' },
];
