// chatGptService/chat-gpt/src/app/modules/itinerary/itinerary.processor.ts
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Classe contenant les fonctions pour convertir les objets en FormData
 */
export class FormDataConverter {
    /**
     * Ajoute un objet de type quelconque au FormData de manière générique.
     * @param formData Objet FormData
     * @param parentKey Clé parent (peut être null)
     * @param obj Objet à ajouter
     */
    public async appendObjectToFormData(
      formData: FormData,
      parentKey: string | null,
      obj: any,
    ): Promise<void> {
      await this.traverseObject(formData, parentKey, obj);
    }
  
    /**
     * Parcourt l'objet de manière récursive et ajoute les champs au FormData.
     * Gère automatiquement les champs contenant 'image' comme des fichiers.
     * @param formData Objet FormData
     * @param parentKey Clé parent actuelle
     * @param obj Objet à parcourir
     */
    private async traverseObject(
      formData: FormData,
      parentKey: string | null,
      obj: any,
    ): Promise<void> {
      if (obj === null || obj === undefined) {
        return;
      }
  
      if (typeof obj === 'boolean') {
        // Convertir les booléens en chaînes "true"/"false"
        if (parentKey) {
          formData.append(parentKey, obj.toString());
        }
      } else if (typeof obj !== 'object' || obj instanceof Date) {
        // Valeur primitive ou Date
        if (parentKey) {
          formData.append(parentKey, obj);
        }
      } else if (Array.isArray(obj)) {
        await Promise.all(
          obj.map(async (value, index) => {
            const arrayKey = parentKey ? `${parentKey}[${index}]` : `${index}`;
            if (
              typeof value === 'string' &&
              (parentKey || '').toLowerCase().includes('image')
            ) {
              await this.appendFileAsync(formData, arrayKey, value);
            } else {
              await this.traverseObject(formData, arrayKey, value);
            }
          }),
        );
      } else {
        // Objet
        await Promise.all(
          Object.entries(obj).map(async ([key, value]) => {
            const fieldKey = parentKey ? `${parentKey}[${key}]` : key;
            if (typeof value === 'string' && key.toLowerCase().includes('image')) {
              await this.appendFileAsync(formData, fieldKey, value);
            } else {
              await this.traverseObject(formData, fieldKey, value);
            }
          }),
        );
      }
    }
  
    /**
     * Ajoute un fichier au FormData de manière asynchrone.
     * Si le fichier n'existe pas, ajoute la chaîne de chemin au lieu du fichier.
     * @param formData Objet FormData
     * @param fieldName Nom du champ dans FormData
     * @param filePath Chemin vers le fichier
     */
    private async appendFileAsync(
      formData: FormData,
      fieldName: string,
      filePath: string,
    ): Promise<void> {
      try {
        const absolutePath = path.resolve(filePath);
        await fs.promises.access(absolutePath, fs.constants.F_OK);
        const fileStream = fs.createReadStream(absolutePath);
        const fileName = path.basename(filePath);
        formData.append(fieldName, fileStream, fileName);
      } catch (error) {
        console.warn(
          `Fichier non trouvé ou erreur : ${filePath}. Ajout de la chaîne de chemin.`,
        );
        formData.append(fieldName, filePath);
      }
    }
  }