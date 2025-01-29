import { findFileWithTwoMatchingWords } from './Utils';
import * as path from 'path';

jest.setTimeout(300000000);


describe('chatgptApi', () => {

  it('should be defined', async () => {
    const directory = path.join(process.cwd(), `/shared/downloads`); // Remplacez par votre répertoire
    const givenFilename = "chiloe-church-museum-ancud-chiloe-island-chile.jpg"; // Nom donné
    console.log(directory);
    console.log(givenFilename);
    const result = await findFileWithTwoMatchingWords(directory, givenFilename);
    console.log(result);

  });
 
});

