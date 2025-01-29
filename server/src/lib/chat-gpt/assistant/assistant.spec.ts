import { AssistantService } from './assistant.service';
import { extractDataFromBalise, getbasePath, sleepFct, writeFileSyncJson } from './../../utils';
import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';

jest.setTimeout(300000000);

const basePath = getbasePath('shared/itineraires');

describe('chatgptApi', () => {
  let service: AssistantService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistantService],
    }).compile();

    service = module.get<AssistantService>(AssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('Get Assistant list', async () => {
    const assistants = await service.getAssistanceList();
    console.log('Get Assistant list');
    console.log(assistants);
    expect(assistants).toBeDefined();
    // check assistant list is type of Assistant[]
    expect(assistants).toBeInstanceOf(Array);
  });

  it('Get Assistant by Id', async () => {
    const assistantId = "asst_awOmxImosGDGvH51tiJfZxO0";
    const assistant = await service.getAssistantById(assistantId);
    console.log('Get Assistant by Id');
    console.log(assistant);
    expect(assistant).toBeDefined();
    // check assistant is type of Assistant
    expect(assistant).toBeInstanceOf(Object);
  });

  it('Set Assistant by Id', async () => {
    const assistant = await service.getAssistantById("asst_awOmxImosGDGvH51tiJfZxO0");
    // Save value to restore it after test
    // const originalName = assistant.name;
    // const orinalTopP = assistant.top_p;
    assistant.model = "gpt-4o-2024-08-06";
    // assistant.name = "Test Assistant";
    // assistant.top_p = 0.5;
    // assistant.description = "Damien est manageur d'un equipe de redaction d'articles d'itineraire. Il a besoin d'un assistant pour generer des articles d'itineraire de voyage, afin de proposer le meilleurs itineraire possible a ses lecteurs.";
    delete assistant.id;

    console.log('Set Assistant by Id');

    await service.setAssistantById("asst_awOmxImosGDGvH51tiJfZxO0", assistant);
    const updatedAssistant = await service.getAssistantById("asst_awOmxImosGDGvH51tiJfZxO0");
    // expect(updatedAssistant).toBeDefined();
    // expect(updatedAssistant).toBeInstanceOf(Object);
    // expect(updatedAssistant.name).toBe("Test Assistant");
    // expect(updatedAssistant.top_p).toBe(0.5);
    // Restore original value
    // assistant.name = originalName;
    // assistant.top_p = orinalTopP;
    // delete updatedAssistant.id;
    // await service.setAssistantById("asst_awOmxImosGDGvH51tiJfZxO0", assistant);

    // const restoredAssistant = await service.getAssistantById("asst_awOmxImosGDGvH51tiJfZxO0");
    // expect(restoredAssistant.name).toBe(originalName);
    // expect(restoredAssistant.top_p).toBe(orinalTopP);
  });

  it('get message list', async () => {
    const threadId = "thread_LlFSc5fkc9Tgc633NiDcg9PL";
    const messages = await service.listMessages(threadId);
    console.log('get message list');
    let messageText = "";
    let index = 1;
    await writeFileSyncJson(path.join(basePath, `${threadId}_all_messages.txt`), messages);
    for (const message of messages.data) {
      messageText += "Message Start" + index + "\n";
      messageText += message.content[0].text.value;
      messageText += "\nMessage End" + index + "\n";
      index++;
    }
    await writeFileSyncJson(path.join(basePath, `${threadId}_messages.txt`), messageText);
  });

  it('Get last message', async () => {
    let texteOriginal = `Ca meurt [START] Voici une introduction. [CONTINUE]
    Plongez dans la dolce vita italienne avec cet itinéraire de lune de miel soigneusement conçu pour vous offrir une semaine de romance et de découvertes. Commencez votre aventure à Naples, une ville vibrante et historique, avant de vous diriger vers les falaises ensoleillées de Sorrente. Terminez votre voyage sur l'île enchanteresse de Capri, où le bleu de la mer Méditerranée rencontre le ciel. Chaque étape de ce voyage est pensée pour vous offrir des moments inoubliables à partager avec votre moitié, le tout dans un cadre idyllique et romantique.
    [CONTINUE]
    Voici le texte qui devrait être supprimé.`;

    // Utilisation de split pour diviser le texte sur la base de la balise [CONTINUE]
    const parties = texteOriginal.split('[CONTINUE]');

    // Vérifier le nombre de balises [CONTINUE] trouvées
    if (parties.length === 3) { // Cela signifie qu'il y a deux balises [CONTINUE]
        // Supprimer tout ce qui se trouve après la deuxième balise [CONTINUE]
        texteOriginal = parties[0] + parties[1]; // Garde le contenu entre les deux [CONTINUE]
    } else if (parties.length === 2) { // Un seul [CONTINUE] trouvé
        // Supprimer tout ce qui se trouve après la première balise [CONTINUE]
        texteOriginal = parties[0]; // Garde le contenu avant la première [CONTINUE]
    }
    texteOriginal = texteOriginal.replace(/^[\s\S]*?\[START\]/, "");
    console.log(texteOriginal);
  })

  it ('Test file By name', async () => {
    const basePathCss = getbasePath('shared/customCss');
    const cssPath = path.join(basePathCss, 'customCss.css');
		const deleteCssFile = await service.deleteFileByName('customCss.css');
		await sleepFct(2000);
		if (deleteCssFile) {
			const upload = await service.uploadFile(cssPath);
      console.log('Test file By name');
      console.log(upload);
			if (upload !== false) {
				await sleepFct(2000);
				await service.overideFileAssistant("asst_wjqD2bNYASUSGLg4zWGBGxNs", ['customCss.css']);
				await sleepFct(2000);
        console.log('CSS file updated, tu peux continuer');
			}
		}
  });

  test('Test internet search', async () => {
    console.log(extractDataFromBalise("titre", "Exemple avec [titre]Bonjour[/titre].")); // "Bonjour"
    
    // Cas 2: Balise absente
    console.log(extractDataFromBalise("titre", "Exemple sans balise.")); // null
    
    // Cas 3: Balise avec caractères spéciaux
    console.log(extractDataFromBalise("NBRE ETAPE", "Exemple avec [NBRE ETAPE] 4 [/NBRE ETAPE].")); // "Spécial"
  });
});

