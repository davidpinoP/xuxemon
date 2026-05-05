import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  // Nombre base del sitio para reutilizarlo al construir los titulos dinamicos.
  private readonly siteName = 'Xuxemons';
  private readonly defaultKeywords = 'Xuxemons, Xuxedex, mochila, inventario, criaturas, juego web, Angular, Laravel, JWT';

  constructor(
    private title: Title,
    private meta: Meta
  ) {}

  update({ title, description, keywords }: SeoConfig): void {
    // Si la pagina ya incluye el nombre del proyecto no lo duplicamos.
    const fullTitle = title.includes(this.siteName) ? title : `${title} - ${this.siteName}`;
    const finalKeywords = keywords || this.defaultKeywords;

    this.title.setTitle(fullTitle);
    // Actualizamos tanto etiquetas SEO clasicas como Open Graph/Twitter
    // para que cada ruta tenga mejor metadata al compartirse o indexarse.
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: finalKeywords });
    this.meta.updateTag({ name: 'language', content: 'es' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_ES' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
  }
}
