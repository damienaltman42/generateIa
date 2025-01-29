import { RunCreateParams } from "openai/resources/beta/threads/runs/runs";
const runCreateParams: RunCreateParams = {
    temperature: 1,
    top_p: 0.85,
    assistant_id: "asst_z80PbGerFo0zJ0372Y0MDid6",
    max_completion_tokens: 16384,

}

export const assistantId = "asst_z80PbGerFo0zJ0372Y0MDid6"

export const step1 = {
    prompt: `Je souhaite que tu m’aides à créer un article de blog qui me permettra d’attirer un maximum de clients lecteur potentiel sur mon blog. 
Réponds uniquement « Ok » si c’est bon pour toi.`,
    runCreateParams
}

export const step2 = {
    prompt: `Voici des informations supplémentaires sur mon contexte : [PROMPT]
Peux-tu me proposer 3 idées d’articles de blog intéressantes pour attirer un maximum de lecteurs potentiels sur mon blog internet ? 
Intègre à ta réflexion différents critères comme 
    - le potentiel de trafic SEO, 
    - l'audience, decrire la cible, comment tu vas la toucher,
    - le niveau de difficulté pour captiver l'attention du lecteur jusqu'à la fin de l'article.
Reponds au format JSON. Ne donne que la réponse attendu.

"ideas": {
    "type": "array",
    "items": {
        "title": {
            "type": "string",
            "description": "Titre de l'article accrocheur et optimisé SEO",
        },
        "potential_seo": {
            "type": "string",
            "description": "100 a 200 mots pour bien comprendre le potentiel de trafic SEO de l'article",
        },
        "audience": {
            "type": "string",
            "description": "100 a 200 mots pour decrire l'audience cible de l'article",
        },
        "engagment": {
            "type": "string",
            "description": "100 a 200 mots pour decrire la difficulté de captiver l'attention du lecteur jusqu'à la fin de l'article"
        }
    }
},
Respect la structure et ne donne que la réponse attendu.`,
    runCreateParams : Object.assign({
        ...runCreateParams, "response_format": { "type": "json_object" }
    })
}

export const step3 = {
    prompt: `Pour chaque proposition, donne-moi une évaluation de son potentiel. Dans ton évaluation, présente-moi les avantages et les inconvénients, le niveau d’effort que cela représente selon mon contexte, les difficultés que je pourrais rencontrer dans la préparation, la rédaction et le ton pour succiter l’intérêt et les solutions possibles. Donne-moi aussi une probabilité de succès en pourcentage pour chaque proposition. Reponds au format texte.`,
    runCreateParams : Object.assign({
        ...runCreateParams, "response_format": { "type": "text" }
    })
}

export const step4 = {
    prompt: `Maintenant, pour chaque proposition, je souhaite que tu m’aides à réfléchir à son application.Pour ça, fais-moi une liste des étapes à suivre pour rédiger l’article, une liste de ressources et aides que je pourrais exploiter et enfin, identifie les potentiels résultats inattendus que je pourrais rencontrer dans l’atteinte de mon objectif et la meilleure manière de les gérer. Reponds au format texte.`,
    runCreateParams : Object.assign({
        ...runCreateParams, "response_format": { "type": "text" }
    })
}

export const step5 = {
    prompt: `Peux-tu me faire un classement des 3 options, de la plus prometteuse à la moins prometteuse ? Pour chaque option, explique-moi précisément pourquoi elle obtient ce classement et donne-moi tes dernières réflexions pour que je puisse prendre ma décision finale. Reponds au format texte.`,
    runCreateParams : Object.assign({
        ...runCreateParams, "response_format": { "type": "text" }
    })
}

export const step6 = {
    prompt: `Merci. 
Peux-tu maintenant me rédiger un titre optimisé pour le SEO et me proposer une trame engageante pour le 1eme article du classement.
Tu devras m'indiquer les mots que je dois utiliser pour effectuer les recherches sur internet pour chaque section de l'article. Si il n'y a pas besoin de faire de recherche, indique le.
Les recherches peuvent etre du type BLOG_ARTICLE, ACHAT_ARTICLE, IMAGE.
Reponds au format JSON. Ne donne que la réponse attendu.

"trame": {
    "title": {
        "type": "string",
        "description": "Titre de l'article accrocheur, engageant et optimisé SEO"
    },
    "introduction": {
        "type": "string",
        "description": "100 a 200 mots pour introduire le sujet de l'article, l'introduction doit donner envie de lire la suite de l'article"
    },
    "sections": {
        "type": "array",
        "items": {
            "subTitle": {
                "type": "string",
                "description": "Sous-titre accrocheur de la section, il doit donner envie de lire la suite de la section"
            },
            "content": {
                "type": "string",
                "description": "resume en deux phrases le contenu de la section, le ton que tu veux donner a la section et le contenu que tu veux y mettre"
            },
            "searchKeywords": {
                "type": "object",
                "keywords": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "description": "Mots clefs a rechercher sur internet pour trouver des informations que tu as besoins. Mettre 'NONE' si il n'y a pas besoin de recherche"
                    },
                    "expected": {
                        "type": "string",
                        "description": "Explque en 100 mots ce que tu recherches exatement et pourquoi tu en a besoin. Ca peux etre des exmaple d'article pour t'inspirer, des articles a acheter pour mettre dans l'article, des images a utiliser, mettre 'NONE' si il n'y a pas besoin de recherche"
                    }
                }
            }
        },
    },
    "tone": {
        "type": "string",
        "description": "descris le ton que tu veux donner a l'article, explique ce que tu veux rajouter pour captiver l'attention du lecteur jusqu'à la fin de l'article"
    }
},
Respect la structure et ne donne que la réponse attendu.`,
    runCreateParams : Object.assign({
        ...runCreateParams, "response_format": { "type": "json_object" }
    })
}