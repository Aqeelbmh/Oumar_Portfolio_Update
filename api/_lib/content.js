// Default site content. The database stores overrides; anything missing falls
// back to this file, so the site keeps working before the first admin save.

export const DEFAULT_CONTENT = {
  profile: {
    name: 'Oumar Bagayoko',
    subtitle: 'Cultural Bridge-builder',
    image: 'profile-image.jpg',
    cvUrl: 'ATS_CV.pdf',
    cvFilename: 'Oumar_Bagayoko_CV.pdf',
    aboutHeading: 'Hey 👋',
    aboutTitle: "I'm Oumar Bagayoko.",
    aboutParagraphs: [
      "I'm a passionate researcher and educator with expertise in research, language learning, and public discourse. Currently based in Mali, I bring a unique perspective shaped by my experiences across Mali, Niger, and Indonesia.",
      'With years of experience in the field of education and research, I focus on enhancing critical thinking, fostering cross-cultural understanding, and promoting interdisciplinary collaboration. My goal is to address global challenges and contribute to meaningful research that drives positive change.',
    ],
    aboutSections: [
      {
        title: 'Inspiration',
        text: "My work is deeply influenced by my family's legacy of learning and the rich cultural heritage of Mali. I believe in the power of education to transform lives and create lasting positive impact in communities.",
      },
      {
        title: 'Hobbies',
        text: "When I'm not researching or teaching, you'll find me exploring literature, engaging in cultural exchange programs, practicing languages, and contributing to educational initiatives.",
      },
    ],
  },

  skills: [
    {
      category: 'Cultural Competencies',
      items: [
        { icon: 'fas fa-globe', label: 'Cross-cultural Communication' },
        { icon: 'fas fa-users', label: 'Team Leadership' },
        { icon: 'fas fa-comments', label: 'Intercultural Communication' },
        { icon: 'fas fa-sync-alt', label: 'Cross-Cultural Adaptability' },
        { icon: 'fas fa-network-wired', label: 'Global Networking' },
        { icon: 'fas fa-handshake', label: 'Conflict Resolution' },
      ],
    },
    {
      category: 'Technical Skills',
      items: [
        { icon: 'fas fa-laptop', label: 'Student Consulting' },
        { icon: 'fas fa-language', label: 'Multilingual Proficiency' },
        { icon: 'fas fa-atom', label: 'Problem Solving' },
        { icon: 'fas fa-book', label: 'Academic Writing' },
        { icon: 'fas fa-chart-line', label: 'Interdisciplinary Collaboration' },
        { icon: 'fas fa-project-diagram', label: 'Project Management' },
      ],
    },
    {
      category: 'Interpersonal Skills',
      items: [
        { icon: 'fas fa-users', label: 'Teamwork' },
        { icon: 'fas fa-sync-alt', label: 'Adaptability' },
        { icon: 'fas fa-ear-listen', label: 'Active Listening' },
        { icon: 'fas fa-comments', label: 'Cross-Cultural Communication' },
        { icon: 'fas fa-microphone', label: 'Public Speaking' },
        { icon: 'fas fa-lightbulb', label: 'Creativity' },
      ],
    },
  ],

  education: [
    {
      dates: '2020 - 2024',
      degree: "Bachelor's Degree in Arts and Human Sciences",
      institution: 'Franco-Arab African Private University',
      location: 'Bamako, Mali',
      description: 'Studies were conducted on person (Offline)',
      certificateUrl:
        'https://drive.google.com/drive/folders/1jNTjuD00lmCJuzTfS-FRuPt3PDnG6T8F?usp=sharing',
    },
    {
      dates: '2020 - 2023',
      degree: "Bachelor's Degree in Arabic Language and Human Sciences",
      institution: 'Islamic University in Niger',
      location: 'Say, Niger',
      description: 'Studies were conducted on person (Online)',
      certificateUrl:
        'https://drive.google.com/drive/folders/1Aj3lMa2ppvN1rY1qVfWxL0eklWOMW5xZ?usp=sharing',
    },
    {
      dates: '2017 - 2019',
      degree: 'Diploma in High School',
      institution: 'Dar El Hadith',
      location: 'Bamako, Mali',
      description: 'Studies were conducted on person (Offline)',
      certificateUrl:
        'https://drive.google.com/drive/folders/1Z35kd08FrfuCrueISor1lT_6bkAkzob6?usp=sharing',
    },
    {
      dates: '2007 - 2016',
      degree: 'Elementary School',
      institution: 'Dar El Fallah',
      location: 'Bamako, Mali',
      description: 'Studies were conducted on person (Offline)',
      certificateUrl:
        'https://drive.google.com/file/d/1dENRhwh_4ePS0gw8z01AWM8ZzfMZq0Gq/view?usp=sharing',
    },
  ],

  experience: [
    {
      dates: '2021 - Present',
      role: 'Student Consultant',
      company: 'Apply for Campus',
      description:
        'Provided guidance to prospective international students on admissions processes and cultural adaptation.',
      achievements: [
        'Mentored over 50 students through the university application process',
        'Facilitated cultural orientation workshops for new international students',
        'Developed multi-language information resources for student use',
      ],
    },
  ],

  languages: [
    {
      name: 'Bambara',
      level: 'Native',
      description:
        'Native speaker with deep understanding of cultural nuances and expressions.',
    },
    {
      name: 'Joula',
      level: 'Native',
      description:
        'Native speaker with deep understanding of cultural nuances and expressions..',
    },
    {
      name: 'Manika',
      level: 'Native',
      description:
        'Native speaker with deep understanding of cultural nuances and expressions..',
    },
    {
      name: 'Arabic',
      level: 'Advanced',
      description: 'Proficient in Modern Standard Arabic and various regional dialects.',
    },
    {
      name: 'French',
      level: 'Native',
      description:
        'Strong command of French language, particularly in diplomatic and cultural contexts.',
    },
    {
      name: 'English',
      level: 'Advanced',
      description:
        'Fluent in both written and spoken English, with experience in academic and professional contexts.',
    },
    {
      name: 'Bahasa Indonesia',
      level: 'Advanced',
      description: 'Good understanding and communication skills in Bahasa Indonesia.',
    },
  ],

  certifications: [
    {
      title: 'Certificate of Participation, International Summer Summit',
      organization: 'Universitas Airlangga',
      year: '2024',
      description:
        'Participated in the International Summer Summit, an event that brings together students from around the world to discuss global issues and exchange ideas.',
      certificateUrl:
        'https://drive.google.com/file/d/1uNImlwwXOMYsvy_g9u7F7ChqEga2ck-R/view?usp=sharing',
    },
    {
      title: 'Certificate of Appreciation, International Summer Course',
      organization: 'Universitas Diponegoro',
      year: '2024',
      description: 'Cultural Collaboration and Cultural Exchange',
      certificateUrl:
        'https://drive.google.com/file/d/12R9JeHbA_Aci1ZXHBzTUt1W8ZQVk42UG/view?usp=sharing',
    },
    {
      title: 'Certificate of Participation, In a Work Shop',
      organization: 'Nusa Putra University',
      year: '2024',
      description: 'Workshop themes includes robotics, engineering design, and problem solving',
      certificateUrl:
        'https://drive.google.com/file/d/1BHVHukckHmFY30TsZR9j2BCAah7v8AwS/view?usp=sharing',
    },
    {
      title: 'Certificate of IELTS Preparation Class',
      organization: 'Kigndom English Center Malang',
      year: '2024',
      description:
        'Prepared for IELTS exam with focus on vocabulary, grammar, and reading comprehension',
      certificateUrl:
        'https://drive.google.com/file/d/12QBDrOnaYkwpQA3d5LRtN8yn0kB2kFNU/view?usp=sharing',
    },
    {
      title: 'Certificate of Appreciation, Impact Circle 8.0',
      organization: 'AIESEC in President University',
      year: '2024',
      description:
        'Participated in Impact Circle 8.0, an event that brings together students from around the world to discuss global issues and exchange ideas.',
      certificateUrl:
        'https://drive.google.com/file/d/17KdACaMgFFupkSSur8Net-6YdYS8B-_8/view?usp=sharing',
    },
    {
      title: 'TOEFL CHS 30',
      organization: 'The American University of Science',
      year: '2023',
      description:
        'TOEFL CHS 30 is a test that measures your ability to understand and use English in an academic context.',
      certificateUrl:
        'https://drive.google.com/file/d/1441BEfaCZ2E0ppTbZ0aJTwQsqQyV3EDu/view?usp=sharing',
    },
    {
      title: 'Basics of Digital Marketing',
      organization: 'Alqasasbiz for Buisness and Marketing Solutions',
      year: '2021',
      description:
        'Learned the basics of digital marketing, including social media marketing, search engine marketing, and email marketing.',
      certificateUrl:
        'https://drive.google.com/file/d/1Xk0oTiotiSrXUfsK30dLIxvLjVxhbcD4/view?usp=sharing',
    },
  ],

  links: {
    whatsapp: 'https://wa.me/22376123456',
    instagram:
      'https://www.instagram.com/bagayokoo291?igsh=MWlta295cnlhd2FlNQ%3D%3D&utm_source=qr',
    facebook: 'https://www.facebook.com/share/1GA66Tcx6X/?mibextid=wwXIfr',
    telegram: 'https://t.me/bagayokooumar64',
    footerAbout:
      'I am an academically driven individual with a strong background in arts, languages, and social sciences. Passionate about cultural diversity and global issues, I aim to foster cross-cultural understanding and critical thinking. With experience in research, public lectures, and international programs, I seek to contribute to meaningful discussions and initiatives that drive positive change.',
    copyright: 'H.K Freelance Studio',
  },
};

const MAX_STRING = 20000;
const MAX_ITEMS = 100;

// Rebuilds a content document using DEFAULT_CONTENT as the shape template, so
// unknown fields are dropped and every field always has a usable value.
export function normalizeContent(input) {
  return walk(input, DEFAULT_CONTENT, 0);
}

function walk(value, template, depth) {
  if (depth > 8) return template;

  if (typeof template === 'string') {
    return typeof value === 'string' ? value.slice(0, MAX_STRING) : template;
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return template;
    const itemTemplate = template[0];
    const cleaned = value
      .slice(0, MAX_ITEMS)
      .map((item) => (itemTemplate === undefined ? item : walk(item, itemTemplate, depth + 1)));
    return cleaned.filter((item) => item !== undefined && item !== null);
  }

  if (template && typeof template === 'object') {
    const source = value && typeof value === 'object' ? value : {};
    const out = {};
    for (const key of Object.keys(template)) {
      out[key] = walk(source[key], template[key], depth + 1);
    }
    return out;
  }

  return template;
}
