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
          student_name: string;
          student_id: string;
          school_id: string;
          response: string | null;
          documents: Json | null;
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
          student_name: string;
          student_id: string;
          school_id: string;
          response?: string | null;
          documents?: Json | null;
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
          student_name?: string;
          student_id?: string;
          school_id?: string;
          response?: string | null;
          documents?: Json | null;
          created_at?: string;
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
