import './styles/base.css';
import './styles/table.css';
import { elements } from './lib/elements';
import { createLegend, createPeriodicTable } from './ui/periodic-table';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Elemento #app não encontrado');
}

app.replaceChildren();

const header = document.createElement('header');
header.className = 'site-header';

const title = document.createElement('h1');
title.textContent = 'chem-toolkit';

const subtitle = document.createElement('p');
subtitle.textContent = 'Tabela periódica interativa com os 118 elementos químicos.';

header.append(title, subtitle);

const main = document.createElement('main');

const section = document.createElement('section');
section.className = 'table-section';
section.setAttribute('aria-labelledby', 'table-title');

const sectionTitle = document.createElement('h2');
sectionTitle.id = 'table-title';
sectionTitle.textContent = 'Tabela periódica';
sectionTitle.className = 'sr-only';

const scrollHint = document.createElement('p');
scrollHint.className = 'scroll-hint';
scrollHint.textContent = 'Deslize para os lados para ver a tabela completa.';

const tableWrapper = document.createElement('div');
tableWrapper.className = 'table-wrapper';
tableWrapper.append(createPeriodicTable(elements));

section.append(sectionTitle, scrollHint, tableWrapper, createLegend());
main.append(section);

const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.append(
  document.createTextNode('Dados: '),
  createLink('https://github.com/Bowserinator/Periodic-Table-JSON', 'Periodic-Table-JSON'),
  document.createTextNode(' (CC BY-SA 3.0) · Nomes: '),
  createLink('https://www.wikidata.org/', 'Wikidata'),
  document.createTextNode(' (CC0) · '),
  createLink('https://github.com/wenderson-hgs/projeto', 'Código no GitHub'),
);

app.append(header, main, footer);

function createLink(href: string, text: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.target = '_blank';
  link.rel = 'noreferrer';
  return link;
}
