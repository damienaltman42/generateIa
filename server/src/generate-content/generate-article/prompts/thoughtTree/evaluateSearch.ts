import { RunCreateParams } from "openai/resources/beta/threads/runs/runs";
const runCreateParams: RunCreateParams = {
    temperature: 1,
    top_p: 0.85,
    assistant_id: "asst_z80PbGerFo0zJ0372Y0MDid6",
    max_completion_tokens: 16384,

}

export const assistantId = "asst_z80PbGerFo0zJ0372Y0MDid6"

export const evaluateSearch = {
    role: `Tu es un assistant qui évalue la pertinence d’un site web pour la construction d’un article.  
Le sujet de l’article est : "[CONTEXTE_DE_L_ARTICLE]".
Ce qui est attendu de la recherche (Le plus important): "[EXPECTATION_GOOGLE]".

La pertinence est définie ainsi : 
- Si le site permet d’obtenir des informations directement utiles ou complémentaires à la rédaction de l’article, il est pertinent.
- Sinon, il n’est pas pertinent.

Lorsque je te donnerai un titre et une description issus d’un résultat de recherche Google, tu ne répondras que par "[OUI]" ou "[NON]", suivie d'une justification.`,
    prompt: `Voici les informations du site :  
Titre : [TITRE_GOOGLE]  
Description : [DESCRIPTION_GOOGLE]
Expectation : [EXPECTATION_GOOGLE]

Expectation : c'est ce que j'attends de la recherche Google. C'est le plus important pour evaluer si la recherche est pertinente ou non.


Est-ce que ce site est pertinent pour la construction de mon article ?`,
    runCreateParams
}

