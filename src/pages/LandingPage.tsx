import React from 'react';
import { Sparkles, ArrowRight, Users, PieChart, Mail, Building, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">AI Marketing Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Se connecter
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Créez du contenu marketing <span className="text-purple-600">percutant</span> avec l'IA
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Générez des articles de blog, newsletters et posts réseaux sociaux en quelques clics. Notre plateforme IA s'occupe de tout.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Voir la démo
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                alt="Marketing Platform"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Qui sommes-nous ?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une équipe passionnée par l'IA et le marketing, dédiée à rendre la création de contenu accessible à tous.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expertise</h3>
              <p className="text-gray-600">Plus de 10 ans d'expérience en marketing digital et IA</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">Technologies de pointe en IA pour des résultats optimaux</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support</h3>
              <p className="text-gray-600">Accompagnement personnalisé pour votre réussite</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="py-20 bg-purple-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos tarifs</h2>
            <p className="text-lg text-gray-600">Des forfaits adaptés à tous les besoins</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Starter</h3>
              <div className="text-4xl font-bold mb-6">19€ <span className="text-base font-normal text-gray-600">/mois</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>5 articles par mois</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Posts réseaux sociaux basiques</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Support email</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
              >
                Commencer
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-500 transform scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm">Populaire</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-6">49€ <span className="text-base font-normal text-gray-600">/mois</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>20 articles par mois</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Posts réseaux sociaux avancés</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Analytics avancés</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
              >
                Commencer
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">99€ <span className="text-base font-normal text-gray-600">/mois</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Contenus illimités</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Fonctionnalités personnalisées</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Support 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>API access</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ils nous font confiance */}
      <section className="py-20 bg-white" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
            <p className="text-lg text-gray-600">Découvrez ce que nos clients disent de nous</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
                  alt="Client"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Sophie Martin</h4>
                  <p className="text-gray-600 text-sm">CEO, TechStart</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Un outil indispensable pour notre stratégie marketing. La qualité du contenu généré est impressionnante."
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
                  alt="Client"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Thomas Dubois</h4>
                  <p className="text-gray-600 text-sm">Marketing Manager, EcoStyle</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Gain de temps considérable sur la création de contenu. L'IA comprend parfaitement notre ton et notre marque."
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
                  alt="Client"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Marie Leroy</h4>
                  <p className="text-gray-600 text-sm">Fondatrice, BeautyLab</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Une solution complète qui nous permet de maintenir une présence constante sur tous nos canaux."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-purple-50" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Nous contacter</h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold">AI Marketing Platform</span>
              </div>
              <p className="text-gray-400">
                Transformez votre marketing avec la puissance de l'IA
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white">À propos</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Tarifs</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Mentions légales</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Restez informé de nos dernières nouveautés</p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2 rounded-l-lg text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-purple-600 px-4 py-2 rounded-r-lg hover:bg-purple-700"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Marketing Platform. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}