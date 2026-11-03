import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    nav_articles: 'Articles',
    nav_cv: 'CV',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_admin: 'Admin',
    nav_admin_portal: 'Admin Portal',
    search_placeholder: 'Search articles by title, keywords...',
    search_btn: 'Search',
    theme_light: 'Switch to Light Mode',
    theme_dark: 'Switch to Dark Mode',

    // Home Hero & Feed
    hero_badge: 'Engineering & Web Development',
    hero_title_1: 'Writing about code, architecture,',
    hero_title_2: 'and real-world problems',
    hero_subtitle: 'Explore hands-on technical tutorials, production post-mortems, and frontend/backend deeps.',
    featured_badge: 'Featured',
    read_article: 'Read article',
    latest_articles: 'Latest Articles',
    no_articles_title: 'No articles published yet',
    no_articles_prefix: 'Check back soon or sign in to the',
    admin_dashboard: 'Admin Dashboard',
    no_articles_suffix: 'to write the first post.',
    min_read: 'min read',
    min_short: 'min',
    views: 'views',
    draft: 'Draft',
    recently_published: 'Recently published',
    pagination_prev: 'Previous',
    pagination_next: 'Next',
    pagination_page: 'Page',
    pagination_of: 'of',

    // Sidebar
    sidebar_view_cv: 'View Full CV & Experience',
    sidebar_newsletter_title: 'Tech Newsletter',
    sidebar_newsletter_desc: 'Get notified whenever I publish a new article about web development or real production solutions. No spam, ever.',
    sidebar_newsletter_placeholder: 'you@domain.com',
    sidebar_subscribe: 'Subscribe',
    sidebar_subscribing: 'Subscribing...',
    sidebar_recent: 'Recent Articles',
    sidebar_categories: 'Categories',
    sidebar_tags: 'Tags',

    // Post Detail
    back_to_articles: 'Back to all articles',
    article_not_found: 'Article Not Found',
    article_not_found_desc: 'The article you are looking for does not exist or may have been unposted.',
    return_to_articles: 'Return to Articles',
    author_role: 'Author & Software Engineer',
    tags_label: 'Tags:',
    comments_title: 'Comments',
    no_comments: 'No comments yet. Be the first to share your thoughts!',
    leave_comment: 'Leave a Comment',
    comment_privacy_note: 'Your email will remain private. Comments are reviewed by the author before appearing publicly.',
    your_name: 'Your Name *',
    your_email: 'Your Email *',
    comment_label: 'Comment *',
    comment_placeholder: 'Share your thoughts, suggestions, or questions...',
    post_comment: 'Post Comment',
    submitting: 'Submitting...',

    // Category & Tag & Search Pages
    category_badge: 'Category',
    articles_in_category: 'articles in this category',
    article_in_category: 'article in this category',
    no_category_articles: 'No articles found in this category yet.',
    tag_badge: 'Tag',
    articles_tagged: 'articles tagged',
    article_tagged: 'article tagged',
    no_tag_articles: 'No articles found with this tag yet.',
    search_title: 'Search Articles',
    search_input_placeholder: 'Search by article title or keywords...',
    search_found: 'Found',
    search_results_for: 'results for',
    search_empty_prompt: 'Type keywords above to search for articles.',
    search_no_match: 'No matching articles found',
    search_no_match_desc: 'Try different keywords or check out categories from the sidebar.',

    // CV Page
    cv_badge: 'Curriculum Vitae',
    download_pdf: 'Download PDF',
    cv_updating_title: 'CV Content Being Updated',
    cv_updating_desc: 'The CV sections will appear here as soon as they are added in the admin dashboard.',

    // About Page
    about_prefix: 'About',
    about_p1: 'Welcome to my personal tech blog. Here, I document real challenges, architectural solutions, and coding techniques that come up while designing, building, and maintaining production applications.',
    about_p2: 'My goal is to share honest reflections, detailed benchmarks, and code recipes that save other developers time and headaches.',
    pillar_1_title: 'Clean Engineering',
    pillar_1_desc: 'Pragmatic TypeScript, modular React patterns, and clean separation of concerns.',
    pillar_2_title: 'Backend & DBs',
    pillar_2_desc: 'PostgreSQL relational modeling, Row Level Security, Edge Workers, and APIs.',
    pillar_3_title: 'Performance',
    pillar_3_desc: 'Real-world latency optimizations, bundle profiling, and edge CDN delivery.',
    about_cta_title: 'Have a technical question or idea?',
    about_cta_desc: 'I am always happy to discuss interesting engineering problems.',
    get_in_touch: 'Get In Touch',

    // Contact Page
    contact_badge: 'Direct Contact',
    contact_title_1: 'Get in',
    contact_title_2: 'Touch',
    contact_subtitle: 'Have a question about an article, a consulting inquiry, or feedback? Send a message directly using the form below.',
    contact_name: 'Your Full Name *',
    contact_email: 'Your Email Address *',
    contact_subject: 'Subject *',
    contact_message: 'Message *',
    contact_send: 'Send Message',
    contact_sending: 'Sending...',

    // Footer
    footer_navigation: 'Navigation',
    footer_cv: 'Curriculum Vitae (CV)',
    footer_about: 'About Me',
    footer_contact: 'Contact Form',
    footer_no_categories: 'No categories yet',
    footer_rights: 'All rights reserved.',
  },
  km: {
    // Navigation
    nav_articles: 'អត្ថបទ',
    nav_cv: 'ប្រវត្តិរូប (CV)',
    nav_about: 'អំពីខ្ញុំ',
    nav_contact: 'ទំនាក់ទំនង',
    nav_admin: 'គ្រប់គ្រង',
    nav_admin_portal: 'ទំព័រគ្រប់គ្រង',
    search_placeholder: 'ស្វែងរកអត្ថបទតាមចំណងជើង ឬពាក្យគន្លឹះ...',
    search_btn: 'ស្វែងរក',
    theme_light: 'ប្តូរទៅផ្ទៃភ្លឺ',
    theme_dark: 'ប្តូរទៅផ្ទៃងងឹត',

    // Home Hero & Feed
    hero_badge: 'វិស្វកម្ម និងការអភិវឌ្ឍន៍គេហទំព័រ',
    hero_title_1: 'សរសេរអំពីកូដ ស្ថាបត្យកម្មប្រព័ន្ធ',
    hero_title_2: 'និងដំណោះស្រាយបញ្ហាជាក់ស្តែង',
    hero_subtitle: 'ស្វែងយល់ពីមេរៀនបច្ចេកទេស បទពិសោធន៍ការងារពិត និងការអភិវឌ្ឍន៍ Frontend/Backend។',
    featured_badge: 'លេចធ្លោ',
    read_article: 'អានអត្ថបទ',
    latest_articles: 'អត្ថបទថ្មីៗបំផុត',
    no_articles_title: 'មិនទាន់មានអត្ថបទត្រូវបានបង្ហោះនៅឡើយទេ',
    no_articles_prefix: 'សូមត្រឡប់មកពិនិត្យម្តងទៀត ឬចូលទៅកាន់',
    admin_dashboard: 'ផ្ទាំងគ្រប់គ្រង (Admin Dashboard)',
    no_articles_suffix: 'ដើម្បីសរសេរអត្ថបទដំបូង។',
    min_read: 'នាទីអាន',
    min_short: 'នាទី',
    views: 'ដងអាន',
    draft: 'ព្រាង',
    recently_published: 'ទើបបង្ហោះថ្មីៗ',
    pagination_prev: 'ទំព័រមុន',
    pagination_next: 'ទំព័របន្ទាប់',
    pagination_page: 'ទំព័រទី',
    pagination_of: 'នៃ',

    // Sidebar
    sidebar_view_cv: 'មើលប្រវត្តិរូប (CV) និងបទពិសោធន៍ការងារ',
    sidebar_newsletter_title: 'ព្រឹត្តិបត្រព័ត៌មានបច្ចេកវិទ្យា',
    sidebar_newsletter_desc: 'ទទួលបានដំណឹងរាល់ពេលខ្ញុំបង្ហោះអត្ថបទថ្មីៗអំពីការអភិវឌ្ឍន៍គេហទំព័រ និងដំណោះស្រាយបច្ចេកទេស។',
    sidebar_newsletter_placeholder: 'you@domain.com',
    sidebar_subscribe: 'ជាវព្រឹត្តិបត្រ',
    sidebar_subscribing: 'កំពុងជាវ...',
    sidebar_recent: 'អត្ថបទថ្មីៗ',
    sidebar_categories: 'ប្រភេទអត្ថបទ',
    sidebar_tags: 'ស្លាក (Tags)',

    // Post Detail
    back_to_articles: 'ត្រឡប់ទៅអត្ថបទទាំងអស់',
    article_not_found: 'រកមិនឃើញអត្ថបទទេ',
    article_not_found_desc: 'អត្ថបទដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានដកចេញ។',
    return_to_articles: 'ត្រឡប់ទៅទំព័រអត្ថបទ',
    author_role: 'អ្នកនិពន្ធ និងវិស្វករកម្មវិធី',
    tags_label: 'ស្លាក៖',
    comments_title: 'មតិយោបល់',
    no_comments: 'មិនទាន់មានមតិយោបល់នៅឡើយទេ។ ចូលរួមបញ្ចេញមតិដំបូងគេ!',
    leave_comment: 'បញ្ចេញមតិយោបល់',
    comment_privacy_note: 'អ៊ីមែលរបស់អ្នកនឹងត្រូវបានរក្សាទុកជាសម្ងាត់។ មតិយោបល់នឹងត្រូវត្រួតពិនិត្យមុនពេលបង្ហាញជាសាធារណៈ។',
    your_name: 'ឈ្មោះរបស់អ្នក *',
    your_email: 'អ៊ីមែលរបស់អ្នក *',
    comment_label: 'មតិយោបល់ *',
    comment_placeholder: 'ចែករំលែកមតិយោបល់ យោបល់កែលម្អ ឬសំណួររបស់អ្នក...',
    post_comment: 'បង្ហោះមតិយោបល់',
    submitting: 'កំពុងបញ្ជូន...',

    // Category & Tag & Search Pages
    category_badge: 'ប្រភេទអត្ថបទ',
    articles_in_category: 'អត្ថបទក្នុងប្រភេទនេះ',
    article_in_category: 'អត្ថបទក្នុងប្រភេទនេះ',
    no_category_articles: 'មិនទាន់មានអត្ថបទក្នុងប្រភេទនេះនៅឡើយទេ។',
    tag_badge: 'ស្លាក',
    articles_tagged: 'អត្ថបទមានស្លាកនេះ',
    article_tagged: 'អត្ថបទមានស្លាកនេះ',
    no_tag_articles: 'មិនទាន់មានអត្ថបទដែលមានស្លាកនេះនៅឡើយទេ។',
    search_title: 'ស្វែងរកអត្ថបទ',
    search_input_placeholder: 'ស្វែងរកតាមចំណងជើងអត្ថបទ ឬពាក្យគន្លឹះ...',
    search_found: 'រកឃើញ',
    search_results_for: 'លទ្ធផលសម្រាប់',
    search_empty_prompt: 'សូមវាយបញ្ចូលពាក្យគន្លឹះខាងលើដើម្បីស្វែងរកអត្ថបទ។',
    search_no_match: 'រកមិនឃើញអត្ថបទដែលត្រូវគ្នាទេ',
    search_no_match_desc: 'សូមសាកល្បងពាក្យគន្លឹះផ្សេង ឬជ្រើសរើសប្រភេទអត្ថបទនៅរបារចំហៀង។',

    // CV Page
    cv_badge: 'ប្រវត្តិរូបសង្ខេប (CV)',
    download_pdf: 'ទាញយក PDF',
    cv_updating_title: 'ទិន្នន័យ CV កំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព',
    cv_updating_desc: 'ផ្នែកនៃប្រវត្តិរូបនឹងបង្ហាញនៅទីនេះនៅពេលត្រូវបានបន្ថែមក្នុងផ្ទាំងគ្រប់គ្រង។',

    // About Page
    about_prefix: 'អំពី',
    about_p1: 'សូមស្វាគមន៍មកកាន់ប្លុកបច្ចេកវិទ្យាផ្ទាល់ខ្លួនរបស់ខ្ញុំ។ នៅទីនេះ ខ្ញុំកត់ត្រាបញ្ហាប្រឈមជាក់ស្តែង ដំណោះស្រាយស្ថាបត្យកម្មប្រព័ន្ធ និងបច្ចេកទេសសរសេរកូដក្នុងការអភិវឌ្ឍន៍កម្មវិធី។',
    about_p2: 'គោលដៅរបស់ខ្ញុំគឺចែករំលែកបទពិសោធន៍ពិត ការវាស់ស្ទង់ល្បឿន និងគន្លឹះកូដដែលជួយសន្សំពេលវេលាដល់អ្នកអភិវឌ្ឍន៍ដទៃទៀត។',
    pillar_1_title: 'វិស្វកម្មកូដស្អាត',
    pillar_1_desc: 'ការប្រើប្រាស់ TypeScript, React patterns និងការរៀបចំរចនាសម្ព័ន្ធកូដឱ្យមានរបៀបរៀបរយ។',
    pillar_2_title: 'Backend & មូលដ្ឋានទិន្នន័យ',
    pillar_2_desc: 'ការរចនា PostgreSQL, Row Level Security, Edge Workers និងប្រព័ន្ធ APIs។',
    pillar_3_title: 'ល្បឿន និងប្រសិទ្ធភាព',
    pillar_3_desc: 'ការបង្កើនល្បឿនប្រព័ន្ធ ការកាត់បន្ថយទំហំកូដ និងការចែកចាយតាមរយៈ Edge CDN។',
    about_cta_title: 'មានសំណួរបច្ចេកទេស ឬគំនិតចង់ពិភាក្សា?',
    about_cta_desc: 'ខ្ញុំរីករាយជានិច្ចក្នុងការពិភាក្សាអំពីបញ្ហាវិស្វកម្មកម្មវិធីដែលគួរឱ្យចាប់អារម្មណ៍។',
    get_in_touch: 'ទាក់ទងមកខ្ញុំ',

    // Contact Page
    contact_badge: 'ទំនាក់ទំនងផ្ទាល់',
    contact_title_1: 'ទាក់ទង',
    contact_title_2: 'មកកាន់ខ្ញុំ',
    contact_subtitle: 'មានសំណួរអំពីអត្ថបទ ការពិគ្រោះយោបល់ ឬមតិកែលម្អ? សូមផ្ញើសារដោយផ្ទាល់តាមរយៈទម្រង់ខាងក្រោម។',
    contact_name: 'ឈ្មោះពេញរបស់អ្នក *',
    contact_email: 'អាសយដ្ឋានអ៊ីមែលរបស់អ្នក *',
    contact_subject: 'ប្រធានបទ *',
    contact_message: 'ខ្លឹមសារសារ *',
    contact_send: 'ផ្ញើសារ',
    contact_sending: 'កំពុងផ្ញើ...',

    // Footer
    footer_navigation: 'ម៉ឺនុយរុករក',
    footer_cv: 'ប្រវត្តិរូបសង្ខេប (CV)',
    footer_about: 'អំពីខ្ញុំ',
    footer_contact: 'ទម្រង់ទំនាក់ទំនង',
    footer_no_categories: 'មិនទាន់មានប្រភេទអត្ថបទនៅឡើយទេ',
    footer_rights: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។',
  },
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lang');
      if (saved === 'km' || saved === 'en') return saved;
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'km' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
