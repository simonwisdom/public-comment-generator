# Public Comment PDF Generator

![homepage](https://github.com/simonwisdom/public-comment-generator/assets/11617175/f855f257-a776-42f6-81f6-37d824fa003f)
![generated_pdf](https://github.com/simonwisdom/public-comment-generator/assets/11617175/15d4742e-0138-4229-8228-a3dfb77e0a95)

## Overview
This application was developed during the Apart Research AI x Governance hackathon to demonstrate vulnerabilities in the public comment system on legislative documents from [federalregister.gov](federalregister.gov). It shows how easily one can generate authentic-looking public comments that could complicate the policymaking process by requiring verification.

## Purpose
The project exposes how AI can manipulate democratic processes, particularly through the automation of public comments, highlighting the need for protective measures in democratic systems.

On some proposed rules in the [Federal Register](federalregister.gov), there are a small number of 'high quality' comments from industry. Typically, these comments include a multipage PDF attachment with an official letterhead. [Carpenter et al. (2022)](https://judgelord.github.io/research/finreg/) found that such comments are more likely to be considered by policymakers and to influence the text of the final bill. 

With that in mind, we set out to build a proof of concept that uses LLMs to reduce the effort required to make such 'high quality' PDF submissions.

## Hackathon Context
Created in a weekend for the Apart Research AI x Governance hackathon, this project explores the intersection of AI and public governance. More about the hackathon can be found [here](https://www.apartresearch.com/post/join-ai-democracy).

## Features
https://github.com/simonwisdom/public-comment-generator/assets/11617175/0b64c990-901d-4167-bd49-eef02cb02ae9
- **Document Retrieval and Summarization**: Fetches and summarizes Federal Register documents using the Claude API with the Haiku model.
- **Logo Acquisition**: Uses the Clearbit API to retrieve official company logos.
- **Dynamic PDF Generation**: Creates structured PDFs that include user inputs, document summaries, and logos.

## Technology Stack
- **Frontend**: React.js
- **APIs**:
  - **Claude API with Haiku Model**: For summarizing documents and generating content.
  - **Clearbit API**: For obtaining company logos.
- **Hosting**: Vercel

## Rationale for Demonstrating Risks to Democracy
This project illustrates the potential for AI to disrupt democratic processes and emphasizes the urgent need for developing strategies to counteract these risks. The simulation aims to inform policymakers and stakeholders, guiding the development of AI governance frameworks to maintain societal stability.
