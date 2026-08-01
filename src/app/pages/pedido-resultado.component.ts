import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="contenedor pagina centro resultado">
      @if (ok) {
        <h1>¡Gracias por tu pedido!</h1>
        <p class="suave">El pago se ha completado correctamente. Te hemos enviado la confirmación
        por correo y puedes seguir el estado desde <a routerLink="/cuenta" class="oro">Mi cuenta</a>.</p>
      } @else {
        <h1>El pago no se ha completado</h1>
        <p class="suave">Tu banco no ha autorizado la operación y el pedido se ha anulado —
        no se te ha cobrado nada. Puedes intentarlo de nuevo desde el
        <a routerLink="/carrito" class="oro">carrito</a> o escribirnos si el problema continúa.</p>
      }
      <a routerLink="/catalogo" class="btn btn-fantasma">Volver al catálogo</a>
    </div>
  `,
  styles: [`
    .resultado { max-width: 560px; padding-top: 5rem; }
    .resultado p { margin-bottom: 2rem; }
  `]
})
export default class PedidoResultadoComponent {
  ok = inject(ActivatedRoute).snapshot.data['ok'] === true;
}