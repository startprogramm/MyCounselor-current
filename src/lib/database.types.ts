export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: 'student' | 'counselor' | 'teacher' | 'parent';
          school_id: string;
          school_name: string;
          grade_level: string | null;
          title: string | null;
          department: string | null;
          profile_image: string | null;
          approved: boolean;
          student_confirmed: boolean;
          subject: string | null;
          children_names: string[] | null;
          relationship: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: 'student' | 'counselor' | 'teacher' | 'parent';
          school_id: string;
          school_name?: string;
          grade_level?: string | null;
          title?: string | null;
          department?: string | null;
          profile_image?: string | null;
          approved?: boolean;
          student_confirmed?: boolean;
          subject?: string | null;
          children_names?: string[] | null;
          relationship?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          role?: 'student' | 'counselor' | 'teacher' | 'parent';
          school_id?: string;
          school_name?: string;
          grade_level?: string | null;
          title?: string | null;
          department?: string | null;
          profile_image?: string | null;
          approved?: boolean;
          student_confirmed?: boolean;
          subject?: string | null;
          children_names?: string[] | null;
          relationship?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: number;
          title: string;
          description: string;
          status: string;
          category: string;
          counselor_name: string;
          counselor_id: string | null;
          teacher_id: string | null;
          teacher_name: string | null;
          student_name: string;
          student_id: string;
          school_id: string;
          response: string | null;
          documents: Json | null;
          recommendation_details: Json | null;
          document_request_details: Json | null;
          academic_support_details: Json | null;
          college_planning_details: Json | null;
          is_urgent: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          status?: string;
          category: string;
          counselor_name?: string;
          counselor_id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          student_name: string;
          student_id: string;
          school_id: string;
          response?: string | null;
          documents?: Json | null;
          recommendation_details?: Json | null;
          document_request_details?: Json | null;
          academic_support_details?: Json | null;
          college_planning_details?: Json | null;
          is_urgent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          status?: string;
          category?: string;
          counselor_name?: string;
          counselor_id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          student_name?: string;
          student_id?: string;
          school_id?: string;
          response?: string | null;
          documents?: Json | null;
          recommendation_details?: Json | null;
          document_request_details?: Json | null;
          academic_support_details?: Json | null;
          college_planning_details?: Json | null;
          is_urgent?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      counselor_availability: {
        Row: {
          id: number;
          counselor_id: string;
          school_id: string;
          weekly_schedule: Json;
          blocked_slots: Json;
          meeting_duration: number;
          buffer_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          counselor_id: string;
          school_id: string;
          weekly_schedule?: Json;
          blocked_slots?: Json;
          meeting_duration?: number;
          buffer_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          counselor_id?: string;
          school_id?: string;
          weekly_schedule?: Json;
          blocked_slots?: Json;
          meeting_duration?: number;
          buffer_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: number;
          title: string;
          counselor_name: string;
          counselor_id: string;
          student_id: string;
          school_id: string;
          date: string;
          time: string;
          type: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          counselor_name: string;
          counselor_id: string;
          student_id: string;
          school_id: string;
          date: string;
          time: string;
          type: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          counselor_name?: string;
          counselor_id?: string;
          student_id?: string;
          school_id?: string;
          date?: string;
          time?: string;
          type?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: number;
          conversation_key: string;
          sender_role: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          conversation_key: string;
          sender_role: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          conversation_key?: string;
          sender_role?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      message_reads: {
        Row: {
          id: number;
          conversation_key: string;
          reader_id: string;
          last_read_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          conversation_key: string;
          reader_id: string;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          conversation_key?: string;
          reader_id?: string;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: number;
          student_id: string;
          school_id: string;
          title: string;
          progress: number;
          deadline: string;
          priority: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          student_id: string;
          school_id: string;
          title: string;
          progress?: number;
          deadline: string;
          priority?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          student_id?: string;
          school_id?: string;
          title?: string;
          progress?: number;
          deadline?: string;
          priority?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          id: number;
          counselor_id: string;
          school_id: string;
          title: string;
          description: string;
          category: string;
          type: string;
          content: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          counselor_id: string;
          school_id: string;
          title: string;
          description: string;
          category: string;
          type: string;
          content: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          counselor_id?: string;
          school_id?: string;
          title?: string;
          description?: string;
          category?: string;
          type?: string;
          content?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      student_academic_profiles: {
        Row: {
          id: string;
          student_id: string;
          school_id: string;
          gpa_weighted: number | null;
          gpa_unweighted: number | null;
          class_rank: number | null;
          class_size: number | null;
          sat_total: number | null;
          sat_math: number | null;
          sat_ebrw: number | null;
          act_composite: number | null;
          ap_courses_taken: string[] | null;
          a_level_courses: Json | null;
          igcse_subjects: Json | null;
          as_level_subjects: Json | null;
          english_test_type: string | null;
          english_test_score: string | null;
          english_test_date: string | null;
          intended_major: string | null;
          career_interests: string[] | null;
          preferred_college_type: string | null;
          extracurriculars: Json | null;
          honors_awards: Json | null;
          target_colleges: string[] | null;
          target_countries: string[] | null;
          college_list: Json | null;
          first_generation: boolean | null;
          financial_aid_need: string | null;
          additional_context: string | null;
          personal_statement: string | null;
          completion_pct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          school_id: string;
          gpa_weighted?: number | null;
          gpa_unweighted?: number | null;
          class_rank?: number | null;
          class_size?: number | null;
          sat_total?: number | null;
          sat_math?: number | null;
          sat_ebrw?: number | null;
          act_composite?: number | null;
          ap_courses_taken?: string[] | null;
          a_level_courses?: Json | null;
          igcse_subjects?: Json | null;
          as_level_subjects?: Json | null;
          english_test_type?: string | null;
          english_test_score?: string | null;
          english_test_date?: string | null;
          intended_major?: string | null;
          career_interests?: string[] | null;
          preferred_college_type?: string | null;
          extracurriculars?: Json | null;
          honors_awards?: Json | null;
          target_colleges?: string[] | null;
          target_countries?: string[] | null;
          college_list?: Json | null;
          first_generation?: boolean | null;
          financial_aid_need?: string | null;
          additional_context?: string | null;
          personal_statement?: string | null;
          completion_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          school_id?: string;
          gpa_weighted?: number | null;
          gpa_unweighted?: number | null;
          class_rank?: number | null;
          class_size?: number | null;
          sat_total?: number | null;
          sat_math?: number | null;
          sat_ebrw?: number | null;
          act_composite?: number | null;
          ap_courses_taken?: string[] | null;
          a_level_courses?: Json | null;
          igcse_subjects?: Json | null;
          as_level_subjects?: Json | null;
          english_test_type?: string | null;
          english_test_score?: string | null;
          english_test_date?: string | null;
          intended_major?: string | null;
          career_interests?: string[] | null;
          preferred_college_type?: string | null;
          extracurriculars?: Json | null;
          honors_awards?: Json | null;
          target_colleges?: string[] | null;
          target_countries?: string[] | null;
          college_list?: Json | null;
          first_generation?: boolean | null;
          financial_aid_need?: string | null;
          additional_context?: string | null;
          personal_statement?: string | null;
          completion_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
