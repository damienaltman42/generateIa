import { GoogleSearchType } from "../../../lib/puppeteer/googleSearch";

export type searchKeywordsType = {
    keywords: string[],
    expected: string,
    result?: GoogleSearchType[],
    searchFinished: string[]
}

export type sectionType = {
    subTitle: string,
    content: string,
    searchKeywords: searchKeywordsType
}
  
  export type trameType = {
    trame: {
      title: string,
      introduction: string,
      sections: sectionType[],
      tone: string
    }
  }
  
  export type constructionArticleType = {
    title: string,
    trame: trameType,
    basePath: string,
    mainThreadId: string,
    nbSections: number
  }