/**
 * Profile Service - Gerenciar dados de perfil do Supabase
 */

class ProfileService {
  constructor(supabaseService) {
    this.supabase = supabaseService;
    this.profile = null;
    this.skills = [];
    this.timeline = [];
    this.certificates = [];
    this.services = [];
  }

  // Dados pessoais do perfil
  async getProfile() {
    try {
      const { data, error } = await this.supabase.client
        .from("profiles")
        .select("*")
        .single();

      if (error) throw error;

      this.profile = data;
      return this.profile;
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      return null;
    }
  }

  // Listar habilidades com percentuais
  async getSkills() {
    try {
      const { data, error } = await this.supabase.client
        .from("skills")
        .select("*")
        .order("category, order_index");

      if (error) throw error;

      this.skills = data || [];
      return this.skills;
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      return [];
    }
  }

  // Timeline (educação + experiência)
  async getTimeline() {
    try {
      const { data, error } = await this.supabase.client
        .from("timeline_items")
        .select("*")
        .order("type, order_index");

      if (error) throw error;

      this.timeline = data || [];
      return this.timeline;
    } catch (error) {
      console.error("Erro ao carregar timeline:", error);
      return [];
    }
  }

  // Certificados para download
  async getCertificates() {
    try {
      const { data, error } = await this.supabase.client
        .from("certificates")
        .select("*")
        .order("order_index");

      if (error) throw error;

      this.certificates = data || [];
      return this.certificates;
    } catch (error) {
      console.error("Erro ao carregar certificados:", error);
      return [];
    }
  }

  // Serviços oferecidos
  async getServices() {
    try {
      const { data, error } = await this.supabase.client
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;

      this.services = data || [];
      return this.services;
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      return [];
    }
  }

  // Filtrar skills por categoria
  getSkillsByCategory(category) {
    return this.skills.filter((skill) => skill.category === category);
  }

  // Filtrar timeline por tipo (education/experience)
  getTimelineByType(type) {
    return this.timeline.filter((item) => item.type === type);
  }

  // Formatar período de tempo
  formatPeriod(period) {
    if (!period) return "";

    // Converter formato "2022 — 2024" para mais legível
    return period.replace("—", "–").trim();
  }

  // Calcular idade a partir do aniversário
  calculateAge(birthday) {
    if (!birthday) return "";

    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Formatar data de aniversário
  formatBirthday(birthday) {
    if (!birthday) return "";

    return new Date(birthday).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Gerar URL de download para certificado
  getCertificateUrl(filename) {
    if (!filename) return null;

    // Assumindo que certificados estão na pasta assets/
    return `./assets/${filename}`;
  }

  // Validar se dados estão completos
  isProfileComplete() {
    return this.profile && this.profile.name && this.profile.title;
  }

  // Cache check - evitar recarregar desnecessariamente
  needsRefresh(lastUpdate, maxAge = 5 * 60 * 1000) {
    // 5 minutos
    if (!lastUpdate) return true;
    return Date.now() - lastUpdate > maxAge;
  }
}

export default ProfileService;
