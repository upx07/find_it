# 🔍 FindIt UniFacens — Sistema Inteligente de Achados e Perdidos

> Plataforma integrada que combina hardware embarcado, inteligência artificial e desenvolvimento web para transformar o processo de gestão de objetos perdidos no campus da UniFacens.

🔗 **[Acessar o projeto](https://find-it-upx07.up.railway.app)**

---

## 📌 Sobre o Projeto

O FindIt UniFacens nasceu de um problema real: a secretaria e a biblioteca da UniFacens recebem em média **200 objetos perdidos por mês**, e a grande maioria nunca é devolvida ao proprietário. O controle era feito por planilhas descentralizadas, sem canal unificado de consulta e sem qualquer automação.

O projeto foi desenvolvido na disciplina **UPx07 (Usina de Projetos Experimentais)** do 7º semestre de Engenharia de Computação da UniFacens, com foco em resolver esse problema de forma inteligente, automatizada e orientada por dados.

---

## 🎯 Como Funciona

### 1. Captura Automática
Uma estação física equipada com **ESP32-CAM** é instalada na secretaria. Quando um objeto é depositado na caixa, a câmera captura automaticamente a imagem sem intervenção manual e a envia via HTTP ao backend.

### 2. Processamento por IA
A imagem é processada por um pipeline de IA que integra **visão computacional** e **LLMs (GPT-4o mini — OpenAI API)**, gerando automaticamente nome, descrição textual, tags de categorização e metadados do objeto.

### 3. Busca com Filtros
O aluno acessa a plataforma, descreve o que perdeu e filtra por categoria, local e data aproximada. O sistema exibe apenas os objetos disponíveis que correspondem à busca — sem expor o catálogo completo.

### 4. Retirada Presencial Rastreável
Após identificar o item, o aluno comparece à secretaria com documento de identificação e o funcionário registra a devolução diretamente na plataforma, gerando um registro rastreável.

### 5. Dashboard Administrativo
O painel de controle permite visualizar o acervo completo, consultar histórico de entradas e saídas por RA e gerar relatórios de devoluções por período.

---

## 📊 Resultados do Piloto

| Aspecto | Resultado |
|---|---|
| Cadastro | Foto + IA eliminaram a digitação manual |
| Busca | Significativamente mais rápida que a planilha |
| Retirada | Eliminação completa de conflitos no processo |
| Adoção | Equipe da secretaria sinalizou que usaria no lugar do Excel |

---

## 💻 Stack Tecnológico

**Backend**
- Elixir + Ash Framework + Phoenix
- GraphQL
- PostgreSQL

**Frontend**
- React + TypeScript
- Apollo Client
- Tailwind CSS

**Hardware**
- ESP32-CAM

**Inteligência Artificial**
- Visão computacional + LLMs — GPT-4o mini (OpenAI API)

**Infraestrutura**
- Docker
- Railway (Deploy)
- Git + GitHub

---

## 🏗️ Arquitetura

```
┌─────────────────┐     HTTP      ┌──────────────────────┐
│   ESP32-CAM     │ ────────────► │   Backend (Phoenix)   │
│ (Captura auto)  │               │   Elixir + Ash + GQL  │
└─────────────────┘               └──────────┬───────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Pipeline de IA  │
                                    │  GPT-4o mini     │
                                    │  OpenAI API      │
                                    └────────┬────────┘
                                             │
                              ┌──────────────▼─────────────┐
                              │        PostgreSQL           │
                              │  (Objetos + Metadados)      │
                              └──────────────┬─────────────┘
                                             │
                    ┌────────────────────────▼──────────────────────┐
                    │              Frontend (React + TS)             │
                    │   Landing Page │ Busca Aluno │ Dashboard Staff │
                    └───────────────────────────────────────────────┘
```

---


## 🌱 ODS da ONU

O projeto contribui com os seguintes Objetivos de Desenvolvimento Sustentável:

- **ODS 4** — Educação de Qualidade: promove um ambiente acadêmico mais eficiente e acolhedor
- **ODS 12** — Consumo e Produção Responsáveis: reduz o desperdício causado pelo descarte de objetos que poderiam ser devolvidos

---

## 👥 Equipe

Desenvolvido na disciplina UPx07 - Usina de Projetos Experimentais | UniFacens | 2026S1

| Nome | RA |
|---|---|
| Bruno da Silveira Escanhoela | 236793 |
| Gabriel Ferreira do Nascimento | 236085 |
| Guilherme Soares Leite Coelho | 235092 |
| Gustavo Oliveira Gomes | 235413 |
| João Guilherme Volta Kinol | 235255 |
| Yuri Peruzzo | 248732 |

**Orientador:** Prof. Wilson Roberto Marcondes de Oliveira Junior

**Banca avaliadora:** Luiz Henrique Goes Rodrigues e Gustavo Takao

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos no Centro Universitário UniFacens.
