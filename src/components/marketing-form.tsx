import React from 'react';
import { useForm } from 'react-hook-form';
import { Rocket, Target, MessageCircle, PenTool } from 'lucide-react';
import { FormField, Select, Input, Checkbox } from './ui/form';

const industries = [
  { value: 'retail', label: 'Retail' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const readingTimes = [
  { value: '2', label: '2 minutes' },
  { value: '5', label: '5 minutes' },
  { value: '10', label: '10 minutes' },
];

const audiences = [
  { value: 'general', label: 'Grand public' },
  { value: 'professional', label: 'Professionnels' },
  { value: 'young-adults', label: 'Jeunes adultes' },
  { value: 'parents', label: 'Parents' },
];

const tones = [
  { value: 'professional', label: 'Professionnel' },
  { value: 'casual', label: 'Amical / Casual' },
  { value: 'inspiring', label: 'Inspirant / Émotionnel' },
  { value: 'humorous', label: 'Humoristique' },
];

const purposes = [
  { value: 'promote', label: 'Promouvoir un produit/service' },
  { value: 'inform', label: 'Informer l\'audience' },
  { value: 'news', label: 'Partager des nouvelles' },
];

export function MarketingForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // TODO: Implement form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FormField label="Secteur d'activité">
            <Select
              {...register('industry')}
              options={industries}
              required
            />
          </FormField>

          <FormField label="URL du site">
            <Input
              {...register('websiteUrl')}
              type="url"
              placeholder="https://example.com"
              required
            />
          </FormField>

          <FormField label="But de l'article">
            <Select
              {...register('purpose')}
              options={purposes}
              required
            />
          </FormField>

          <FormField label="Sujet de l'article">
            <Input
              {...register('subject')}
              type="text"
              placeholder="Thème principal de votre contenu"
              required
            />
          </FormField>
        </div>

        <div>
          <FormField label="Temps de lecture estimé">
            <Select
              {...register('readingTime')}
              options={readingTimes}
              required
            />
          </FormField>

          <FormField label="Audience cible">
            <Select
              {...register('audience')}
              options={audiences}
            />
          </FormField>

          <FormField label="Ton de communication">
            <Select
              {...register('tone')}
              options={tones}
            />
          </FormField>

          <FormField label="Mots-clés importants">
            <Input
              {...register('keywords')}
              type="text"
              placeholder="Séparez les mots-clés par des virgules"
            />
          </FormField>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Type de contenu à générer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            {...register('generateBlog')}
            label="Article de blog"
          />
          <Checkbox
            {...register('generateEmail')}
            label="Email"
          />
          <Checkbox
            {...register('generateSocial')}
            label="Posts réseaux sociaux"
          />
          <Checkbox
            {...register('generateStory')}
            label="Script de Story"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Rocket className="w-5 h-5" />
          <span>Générer le contenu</span>
        </button>
      </div>
    </form>
  );
}