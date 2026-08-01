# Curso ATS — Material de Apoio às Aulas

Ambiente web de apoio às aulas de **Atendimento a Tentativas de Suicídio (ATS)**, publicado no GitHub Pages.

A página organiza, em uma única interface, apresentações dos encontros, conteúdos complementares, materiais técnicos e vídeos de apoio.

## Página publicada

https://ricmurtapsicologia.github.io/Curso-ATS/

## Estrutura didática

A navegação foi organizada para favorecer uma trilha simples e progressiva:

1. Encontro 1 — Aspectos Gerais
2. Encontro 2 — Abordagem Técnica
3. Encontro 3 — Aspectos Específicos
4. Encontro 4 — Gerenciamento em ATS
5. Conteúdos complementares
6. Materiais técnicos
7. Vídeos de apoio

## Diretrizes do projeto

A versão atual adota uma política de **refatoração conservadora**: preservar a identidade, o conteúdo e a estrutura existentes, realizando apenas ajustes que aumentem confiabilidade, acessibilidade, responsividade e manutenção.

Decisões preservadas:

- identidade visual escura em azul-marinho, dourado/amarelo e branco;
- hero principal e arquitetura geral da página;
- sequência didática dos quatro encontros;
- cards e imagens originais dos cards;
- acesso às apresentações pelo visualizador, Google Slides e PPTX;
- conteúdos complementares;
- biblioteca de materiais;
- vídeos incorporados;
- rodapé com links, contato e participação.

## Melhorias implementadas

- onboarding exibido automaticamente apenas na primeira visita;
- opção permanente **“Como usar este ambiente”** para reabrir o onboarding;
- splash mais curto em visitas recorrentes;
- melhoria do gerenciamento de foco e `aria-labelledby` no onboarding;
- link de acessibilidade **“Pular para o conteúdo”**;
- alvos interativos maiores em telas móveis;
- consolidação das regras responsivas;
- revisão de legibilidade em dispositivos móveis;
- simplificação do visualizador de apresentações;
- remoção da navegação artificial por IDs `p1`, `p2`, etc.;
- uso dos controles nativos do Google Slides;
- reorganização da biblioteca em “Doutrina e referências” e “Recursos complementares”;
- revisão pontual da linguagem clínica;
- remoção do Tawk.to para reduzir dependências externas e rastreamento;
- manutenção do Google Analytics com solicitação de anonimização de IP;
- inclusão de informações de privacidade no rodapé;
- favicon independente de imagem externa;
- preservação das imagens dos cards e dos links de conteúdo existentes.

## Tecnologias

O projeto permanece propositalmente simples:

- HTML5;
- CSS3;
- JavaScript sem framework;
- GitHub Pages;
- Remix Icon;
- Google Slides;
- YouTube;
- Google Analytics.

Não há backend, banco de dados, sistema de autenticação ou etapa de build.

## Manutenção

### Atualizar uma apresentação

No `index.html`, localize o card correspondente e atualize o identificador em:

```html
data-slide-id="ID_DA_APRESENTACAO"
```

Mantenha também os links de visualização e exportação PPTX sincronizados.

### Atualizar um material

Os materiais estão no bloco:

```html
<div id="materials-links" class="hidden-links">
```

Mantenha títulos claros, ano da publicação quando aplicável e URLs oficiais ou controladas.

### Atualizar um vídeo

Os vídeos usam incorporação do YouTube:

```html
https://www.youtube.com/embed/ID_DO_VIDEO
```

Verifique o título do `iframe` para preservar acessibilidade.

### Imagens dos cards

As imagens dos cards fazem parte da identidade visual atual e devem ser preservadas, salvo decisão editorial expressa de substituição.

## Acessibilidade

A página inclui:

- HTML semântico;
- textos alternativos em imagens;
- foco visível;
- navegação por teclado;
- link para pular ao conteúdo;
- atributos ARIA nos componentes interativos;
- respeito a `prefers-reduced-motion`;
- tamanhos mínimos de interação aprimorados para dispositivos móveis.

## Privacidade e serviços externos

A página utiliza Google Analytics para métricas gerais de navegação e contém conteúdos/links de serviços externos, como Google Slides, Google Drive e YouTube.

O chat Tawk.to foi removido para reduzir dependências, rastreamento e interferência na experiência.

## Critério de evolução

Antes de qualquer alteração estrutural, priorizar:

1. preservar a trilha didática;
2. preservar o conteúdo existente;
3. evitar dependências desnecessárias;
4. garantir funcionamento em desktop e mobile;
5. manter acessibilidade e legibilidade;
6. realizar mudanças incrementais e reversíveis.

---

Projeto mantido como ambiente educacional de apoio ao curso de ATS.
