import yaml from 'yaml'
import resumeData from '~/data/resume.yml?raw'

// Types for YAMLResume schema
export interface ResumeBasics {
  name: string
  headline: string
  phone?: string
  email: string
  url?: string
  summary: string[]
  location: {
    address?: string
    city: string
    region?: string
    country: string
    postalCode?: string
  }
  profiles: {
    network: string
    url: string
    username: string
  }[]
}

export interface ResumeWork {
  name: string
  url?: string
  position: string
  startDate: string
  endDate: string
  summary: string[]
  keywords?: string[]
}

export interface ResumeEducation {
  institution: string
  url?: string
  degree: string
  area: string
  score?: string
  startDate: string
  endDate: string
  courses?: string[]
  summary?: string[]
}

export interface ResumeSkill {
  name: string
  level: string
  keywords: string[]
}

export interface ResumeLanguage {
  language: string
  fluency: string
  keywords?: string[]
}

export interface ResumeProject {
  name: string
  url?: string
  description: string
  startDate?: string
  endDate?: string
  summary?: string[]
  keywords?: string[]
}

export interface ResumeInterest {
  name: string
  keywords: string[]
}

export interface ResumeCertificate {
  name: string
  issuer: string
  date: string
  url?: string
}

export interface ResumeContent {
  basics: ResumeBasics
  work?: ResumeWork[]
  education?: ResumeEducation[]
  skills?: ResumeSkill[]
  languages?: ResumeLanguage[]
  projects?: ResumeProject[]
  interests?: ResumeInterest[]
  awards?: any[]
  certificates?: ResumeCertificate[]
  publications?: any[]
  volunteer?: any[]
  references?: any[]
}

export interface Resume {
  content: ResumeContent
  locale?: {
    language: string
  }
  layouts?: any[]
}

// Parse YAML once
const resume: Resume = yaml.parse(resumeData)

export function useResume() {
  const basics = computed(() => resume.content.basics)
  const work = computed(() => resume.content.work || [])
  const education = computed(() => resume.content.education || [])
  const skills = computed(() => resume.content.skills || [])
  const languages = computed(() => resume.content.languages || [])
  const projects = computed(() => resume.content.projects || [])
  const interests = computed(() => resume.content.interests || [])
  const certificates = computed(() => resume.content.certificates || [])

  // Helper to get social profile by network name
  const getProfile = (network: string) => {
    return basics.value.profiles?.find(
      p => p.network.toLowerCase() === network.toLowerCase()
    )
  }

  // Helper to format date range
  const formatDateRange = (startDate: string, endDate: string, locale: string = 'fr') => {
    const formatDate = (date: string) => {
      if (!date) return locale === 'fr' ? 'Présent' : 'Present'
      const d = new Date(date)
      return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        year: 'numeric'
      })
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  // Get skills by category for display
  const skillsByCategory = computed(() => {
    const development = skills.value.find(s => 
      s.name.toLowerCase().includes('backend') || 
      s.name.toLowerCase().includes('frontend') ||
      s.name.toLowerCase().includes('développement')
    )
    const infrastructure = skills.value.find(s => 
      s.name.toLowerCase().includes('devops') || 
      s.name.toLowerCase().includes('infrastructure')
    )
    const other = skills.value.find(s => 
      s.name.toLowerCase().includes('outil') || 
      s.name.toLowerCase().includes('méthodolog')
    )

    return {
      development: development?.keywords || [],
      infrastructure: infrastructure?.keywords || [],
      other: other?.keywords || []
    }
  })

  // Get all skill keywords flattened
  const allSkillKeywords = computed(() => {
    return skills.value.flatMap(s => s.keywords)
  })

  return {
    resume,
    basics,
    work,
    education,
    skills,
    languages,
    projects,
    interests,
    certificates,
    getProfile,
    formatDateRange,
    skillsByCategory,
    allSkillKeywords
  }
}
