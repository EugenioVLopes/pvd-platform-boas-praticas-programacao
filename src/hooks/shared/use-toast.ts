"use client";

// Inspired by react-hot-toast library
import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

/** Limite máximo de toasts exibidos simultaneamente */
const TOAST_LIMIT = 1;
/** Tempo em milissegundos antes de remover um toast da memória */
const TOAST_REMOVE_DELAY = 1000000;

/**
 * Tipo estendido de toast com propriedades adicionais para controle interno
 */
export type ToasterToast = ToastProps & {
  /** Identificador único do toast */
  id: string;
  /** Título do toast */
  title?: React.ReactNode;
  /** Descrição ou conteúdo do toast */
  description?: React.ReactNode;
  /** Elemento de ação (botão) do toast */
  action?: ToastActionElement;
};

/**
 * Tipos de ações disponíveis para o reducer de toasts
 */
type ActionTypes = {
  ADD_TOAST: "ADD_TOAST";
  UPDATE_TOAST: "UPDATE_TOAST";
  DISMISS_TOAST: "DISMISS_TOAST";
  REMOVE_TOAST: "REMOVE_TOAST";
};

let count = 0;

/**
 * Gera um ID único para cada toast
 * @returns String com ID único
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

/**
 * Ações possíveis para o gerenciamento de estado dos toasts
 */
type Action =
  | {
      type: ActionTypes["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionTypes["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionTypes["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionTypes["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

/**
 * Estado global dos toasts
 */
export interface ToastState {
  /** Lista de toasts ativos */
  toasts: ToasterToast[];
}

/** Mapa de timeouts para remoção automática de toasts */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Adiciona um toast à fila de remoção automática
 * @param toastId - ID do toast a ser removido
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Reducer para gerenciar o estado dos toasts
 * @param state - Estado atual
 * @param action - Ação a ser executada
 * @returns Novo estado
 */
export const reducer = (state: ToastState, action: Action): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        for (const toast of state.toasts) {
          addToRemoveQueue(toast.id);
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

/** Lista de listeners para mudanças de estado */
const listeners: Array<(state: ToastState) => void> = [];

/** Estado em memória dos toasts */
let memoryState: ToastState = { toasts: [] };

/**
 * Despacha uma ação para o reducer e notifica todos os listeners
 * @param action - Ação a ser executada
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  for (const listener of listeners) {
    listener(memoryState);
  }
}

/**
 * Tipo para criação de toast (sem ID, que é gerado automaticamente)
 */
export type Toast = Omit<ToasterToast, "id">;

/**
 * Retorno da função toast com métodos de controle
 */
export interface ToastReturn {
  /** ID único do toast criado */
  id: string;
  /** Função para dispensar o toast */
  dismiss: () => void;
  /** Função para atualizar o toast */
  update: (props: ToasterToast) => void;
}

/**
 * Cria e exibe um novo toast
 *
 * @param props - Propriedades do toast
 * @param props.title - Título do toast
 * @param props.description - Descrição do toast
 * @param props.variant - Variante visual do toast (default, destructive)
 * @param props.action - Elemento de ação (botão) do toast
 *
 * @returns Objeto com métodos para controlar o toast
 *
 * @example
 * ```tsx
 * // Toast simples
 * toast({
 *   title: "Sucesso!",
 *   description: "Operação realizada com sucesso."
 * });
 *
 * // Toast com ação
 * toast({
 *   title: "Erro",
 *   description: "Algo deu errado.",
 *   variant: "destructive",
 *   action: <Button onClick={() => retry()}>Tentar novamente</Button>
 * });
 *
 * // Toast controlado
 * const myToast = toast({ title: "Carregando..." });
 * // Depois atualizar
 * myToast.update({ title: "Concluído!", description: "Processo finalizado." });
 * // Ou dispensar
 * myToast.dismiss();
 * ```
 */
function toast({ ...props }: Toast): ToastReturn {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Retorno do hook useToast
 */
export interface UseToastReturn extends ToastState {
  /** Função para criar um novo toast */
  toast: typeof toast;
  /** Função para dispensar um ou todos os toasts */
  dismiss: (toastId?: string) => void;
}

/**
 * Hook para gerenciar toasts (notificações temporárias)
 *
 * Este hook fornece uma interface completa para exibir e gerenciar toasts,
 * incluindo criação, atualização, dispensar e controle de estado global.
 *
 * Características:
 * - Limite de toasts simultâneos configurável
 * - Remoção automática após timeout
 * - Suporte a ações personalizadas
 * - Estado global compartilhado entre componentes
 * - Variantes visuais (success, error, warning, etc.)
 *
 * @returns Objeto com estado dos toasts e funções de controle
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { toast, toasts, dismiss } = useToast();
 *
 *   const showSuccess = () => {
 *     toast({
 *       title: "Sucesso!",
 *       description: "Dados salvos com sucesso.",
 *       variant: "default"
 *     });
 *   };
 *
 *   const showError = () => {
 *     toast({
 *       title: "Erro",
 *       description: "Falha ao salvar dados.",
 *       variant: "destructive"
 *     });
 *   };
 *
 *   const dismissAll = () => {
 *     dismiss(); // Remove todos os toasts
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={showSuccess}>Mostrar Sucesso</button>
 *       <button onClick={showError}>Mostrar Erro</button>
 *       <button onClick={dismissAll}>Limpar Todos</button>
 *       <p>Toasts ativos: {toasts.length}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Uso em operações assíncronas
 * function DataForm() {
 *   const { toast } = useToast();
 *
 *   const handleSubmit = async (data: FormData) => {
 *     const loadingToast = toast({
 *       title: "Salvando...",
 *       description: "Aguarde enquanto salvamos seus dados."
 *     });
 *
 *     try {
 *       await saveData(data);
 *       loadingToast.update({
 *         title: "Sucesso!",
 *         description: "Dados salvos com sucesso."
 *       });
 *     } catch (error) {
 *       loadingToast.update({
 *         title: "Erro",
 *         description: "Falha ao salvar dados.",
 *         variant: "destructive"
 *       });
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
function useToast(): UseToastReturn {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { toast, useToast };
