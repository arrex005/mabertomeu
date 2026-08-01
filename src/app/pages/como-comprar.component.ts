import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="contenedor pagina">
      <header class="portada">
        <h1>Cómo comprar</h1>
        <svg class="arco" viewBox="0 0 120 22" aria-hidden="true">
          <path d="M4 20 Q60 -14 116 20" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <p class="entrada">Todo lo que necesitas saber para comprar en MA. BERTOMEU, sin letra pequeña escondida.</p>
      </header>

      <div class="disposicion">
        <nav class="indice" aria-label="Secciones">
          <a href="#pedido">Hacer un pedido</a>
          <a href="#pago">Formas de pago</a>
          <a href="#envio">Envío</a>
          <a href="#devoluciones">Devoluciones</a>
          <a href="#garantia">Garantía</a>
        </nav>

        <div class="secciones">
          <section id="pedido">
            <h2>Hacer un pedido</h2>
            <p>Puedes comprar cualquier pieza directamente desde el <a routerLink="/catalogo" class="oro">catálogo</a>. Para tramitar el pedido necesitas una cuenta: así conocemos tu dirección de envío y puedes seguir el estado de tus pedidos en cualquier momento desde <em>Mi cuenta</em>.</p>
            <p>Si buscas una combinación concreta de material y piedra que no aparece en la ficha del producto, escríbenos desde el formulario de contacto y estudiamos tu encargo: trabajamos muchas piezas de forma personalizada.</p>
            <p>Todos los precios mostrados incluyen IVA. Los gastos de envío se añaden al confirmar el pedido, antes del pago. Si detectáramos un error tipográfico en algún precio, te avisaríamos antes de procesar nada para que puedas anular el pedido sin coste.</p>
          </section>

          <section id="pago">
            <h2>Formas de pago</h2>
            <h3>Tarjeta</h3>
            <p>El pago se realiza en la pasarela segura de nuestro banco. Tus datos viajan cifrados directamente a la entidad bancaria: nosotros nunca vemos ni almacenamos el número de tu tarjeta. Si el banco deniega la operación, el pedido se anula automáticamente y te lo indicamos en pantalla.</p>
            <h3>Bizum</h3>
            <p>Funciona igual que la tarjeta, a través de la misma pasarela segura del banco. Solo necesitas tener Bizum activo en tu entidad.</p>
            <h3>Transferencia bancaria</h3>
            <p>Si lo prefieres, puedes pagar por transferencia sin coste adicional. Al elegir esta opción te indicaremos el número de cuenta; incluye tu número de pedido y tu nombre en el concepto y envíanos el justificante por correo. El pedido se prepara al confirmarse el ingreso.</p>
          </section>

          <section id="envio">
            <h2>Envío</h2>
            <p>Preparamos cada pedido en nuestro taller y te avisamos por correo electrónico cuando sale hacia tu dirección. La entrega habitual es de 24 a 72 horas laborables desde que la pieza está lista. Las piezas hechas por encargo requieren tiempo de taller; te indicaremos el plazo estimado al confirmar el pedido.</p>
            <p>Cuando recibas el paquete, revísalo en el momento de la entrega. Si llega abierto o con signos evidentes de daño, puedes rechazarlo y escribirnos: lo resolvemos.</p>
          </section>

          <section id="devoluciones">
            <h2>Devoluciones</h2>
            <p>Tienes 14 días naturales desde la entrega para devolver cualquier pieza, de acuerdo con la legislación española de comercio minorista. Escríbenos antes por correo y te enviaremos las instrucciones de devolución.</p>
            <p>La pieza debe volver en perfecto estado, con su embalaje y protecciones originales. Los gastos del envío de vuelta corren por tu cuenta. Una vez recibida y revisada, te reembolsamos el importe por el mismo medio de pago en un plazo máximo de 7 días.</p>
          </section>

          <section id="garantia">
            <h2>Garantía</h2>
            <p>Todas nuestras piezas están cubiertas por la garantía legal de conformidad que establece la Ley General para la Defensa de los Consumidores y Usuarios. Si una pieza presenta cualquier falta de conformidad, tienes derecho a su reparación, sustitución, rebaja del precio o resolución de la compra.</p>
            <p>Ante cualquier duda o incidencia, escríbenos: siempre buscamos primero una solución directa y rápida contigo.</p>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portada { text-align: center; margin-bottom: 3rem; }
    .portada .entrada { max-width: 50ch; margin-top: 1rem; }
    .disposicion {
      display: grid; grid-template-columns: 200px 1fr;
      gap: 3rem; align-items: start; max-width: 980px; margin: 0 auto;
    }
    .indice { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 0.4rem; }
    .indice a {
      font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--tinta-suave); padding: 0.3rem 0 0.3rem 0.9rem;
      border-left: 2px solid var(--linea);
    }
    .indice a:hover { color: var(--oro-oscuro); border-left-color: var(--oro); }
    section { margin-bottom: 3rem; scroll-margin-top: 100px; }
    section p { color: var(--tinta-suave); max-width: 65ch; }
    section h3 { font-size: 1.2rem; margin-top: 1.5rem; }
    @media (max-width: 760px) {
      .disposicion { grid-template-columns: 1fr; gap: 1rem; }
      .indice { position: static; flex-direction: row; flex-wrap: wrap; gap: 0.75rem; }
      .indice a { border-left: none; padding-left: 0; border-bottom: 1px solid var(--linea); }
    }
  `]
})
export default class ComoComprarComponent {}