export type SkillItem = {
    title: string
    percent: number
}

export type AboutBoxItem = {
    title: string
    image: string | null
    text: string | null
}

export type BasicConfigData = {
    company_info: string | null
    manager_contact: string | null
    technical_support: string | null
    address: string | null
    number_phone: string | null
    hotline: string | null
    product_news_list: string | null
    product_hot_list: string | null
    project_hot_list: string | null
    textlink_footer: string | null
    extra_code: string | null
    facebook: string | null
    google_plus: string | null
    youtube: string | null
}

export type AboutConfigData = {
    hotline: string | null
    about_text_1: string | null
    about_title_box_2: string | null
    about_text_2: string | null
    about_skill: SkillItem[] | null
    about_title_box_3: string | null
    about_text_3: string | null
    about_title_box_4: string | null
    about_box_4: AboutBoxItem[] | null
    about_title_box_5: string | null
    about_text_5: string | null
    about_box_5: AboutBoxItem[] | null
}

export type BasicConfigInput = Partial<BasicConfigData>
export type AboutConfigInput = Partial<AboutConfigData>
