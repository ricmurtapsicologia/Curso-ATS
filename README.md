# Curso ATS — Material de Apoio às Aulas

Ambiente web de apoio às aulas de **Atendimento a Tentativas de Suicídio (ATS)**, publicado no GitHub Pages.

Página oficial:

https://ricmurtapsicologia.github.io/Curso-ATS/

## Situação canônica — setembro de 2026

A página principal concentra em uma única URL:

- tela de identificação/acesso;
- trilha dos encontros ATS;
- apresentações;
- materiais técnicos;
- conteúdos complementares;
- vídeos e áudios de apoio.

A antiga página `Curso-ATS-Login` não deve mais operar como aplicação independente. Ela permanece apenas como rota legada de redirecionamento para a página oficial.

## Estrutura didática vigente

1. Encontro 1 — Fundamentos do ATS
2. Encontro 2 — Abordagem Técnica no ATS
3. Encontro 3 — Cenários Específicos do ATS
4. Encontro 4 — Gerenciamento da Ocorrência de ATS
5. Conteúdos complementares
6. Materiais técnicos
7. Vídeos e áudios de apoio

As quatro apresentações principais foram reconciliadas com os materiais ATS CFO 2026 saneados.

A referência doutrinária principal da biblioteca é a **ITO 30 — 2ª edição, revisão 2026 — v3.7 canônica**.

## Identidade e experiência

Diretrizes preservadas:

- identidade visual institucional em azul-marinho, amarelo/dourado e branco;
- hero e arquitetura geral da página;
- sequência didática progressiva;
- cards de apresentações;
- visualizador de Google Slides;
- biblioteca de materiais;
- vídeos incorporados;
- conteúdo responsivo para desktop, tablet e celular;
- acessibilidade por teclado, foco visível, textos alternativos e redução de movimento.

## Controle de acesso

A página possui gate de identificação integrado à própria URL oficial.

Características atuais:

- validação local das credenciais autorizadas;
- credenciais armazenadas no código apenas como hashes SHA-256;
- sessão temporária de 8 horas em `sessionStorage`;
- bloqueio temporário após tentativas inválidas repetidas;
- logout explícito;
- isolamento do conteúdo de fundo com `inert` e `aria-hidden` enquanto o gate está ativo;
- contenção de foco dentro da tela de acesso.

### Limite técnico importante

O projeto continua hospedado em **GitHub Pages**, sem backend e sem banco de dados. Portanto, este gate é uma barreira de acesso no lado do cliente e **não equivale a autenticação de servidor**.

Os arquivos publicados pelo GitHub Pages e os recursos externos que sejam públicos continuam tecnicamente recuperáveis por quem conhecer os endereços ou inspecionar o código. Para controle de acesso forte, será necessário migrar a autenticação e os recursos protegidos para uma camada server-side ou provedor de identidade.

## Privacidade e indexação

Foram adotadas medidas de redução de exposição:

- `robots.txt` com bloqueio de rastreamento;
- meta `robots` e `googlebot` inseridas pela camada de saneamento com `noindex,nofollow,noarchive`;
- coleta do Google Analytics desativada enquanto não houver consentimento explícito;
- remoção prévia do Tawk.to;
- não publicação de matrículas ou CPFs em texto puro no código de autenticação.

Essas medidas reduzem indexação e rastreamento, mas não substituem autenticação server-side.

## Arquivos principais

- `index.html` — estrutura semântica e conteúdo-base;
- `styles.css` — identidade visual e responsividade;
- `app.js` — comportamento geral da página e carregamento das camadas auxiliares;
- `auth.js` — gate de identificação, sessão e validação local por hash;
- `auth.css` — skin integrada do acesso;
- `hardening.js` — reconciliação dos recursos canônicos 2026, noindex, privacidade e isolamento do gate;
- `audio-aulas.js` / `audio-aulas.css` — recursos de áudio;
- `robots.txt` — redução de indexação;
- `README.md` — documentação técnica atual.

## Regra de manutenção

Antes de alterar a página:

1. preservar a URL oficial `Curso-ATS/`;
2. preservar a trilha didática e a identidade visual aprovada;
3. não remover credenciais durante refatorações visuais;
4. não publicar matrículas ou CPFs em texto puro;
5. apontar doutrina e aulas para as versões canônicas vigentes;
6. testar desktop e mobile;
7. testar credencial válida, inválida, cooldown, sessão, expiração e logout;
8. testar navegação por teclado e foco do gate;
9. revisar links externos antes da publicação;
10. executar Auditoria 30/30 e Auditoria 90/90 após alterações estruturais.

## Critério de segurança

Enquanto a hospedagem permanecer no GitHub Pages, considerar o acesso como **controle leve contra acesso casual**, não como ambiente confidencial. Conteúdo que exija confidencialidade ou autorização forte não deve depender exclusivamente desta arquitetura estática.
