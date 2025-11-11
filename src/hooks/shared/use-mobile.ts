import { BaseHookOptions } from "@/types";
import * as React from "react";

const DEFAULT_MOBILE_BREAKPOINT = 768;
const DEFAULT_TABLET_BREAKPOINT = 1024;

export interface UseMobileOptions extends BaseHookOptions {
  breakpoint?: number;
  tabletBreakpoint?: number;
}

export interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: number;
  tabletBreakpoint: number;
  screenWidth: number | undefined;
}

/**
 * Hook para detectar tipo de dispositivo baseado em breakpoints configuráveis
 *
 * Detecta se o usuário está em um dispositivo móvel, tablet ou desktop
 * baseado em breakpoints configuráveis. Usa matchMedia para performance
 * otimizada e reatividade a mudanças de orientação.
 *
 * @param options - Opções de configuração do hook
 * @param options.enabled - Se o hook deve estar ativo
 * @param options.breakpoint - Breakpoint para detecção mobile (padrão: 768px)
 * @param options.tabletBreakpoint - Breakpoint para detecção tablet (padrão: 1024px)
 *
 * @returns Objeto com informações sobre o tipo de dispositivo
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { isMobile, isTablet, isDesktop } = useMobile();
 *
 *   if (isMobile) {
 *     return <MobileLayout />;
 *   }
 *
 *   if (isTablet) {
 *     return <TabletLayout />;
 *   }
 *
 *   return <DesktopLayout />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Com breakpoints customizados
 * function CustomBreakpoints() {
 *   const { isMobile, screenWidth } = useMobile({
 *     breakpoint: 640,
 *     tabletBreakpoint: 1280
 *   });
 *
 *   return (
 *     <div>
 *       <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
 *       <p>Screen width: {screenWidth}px</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMobile(options: UseMobileOptions = {}): UseMobileReturn {
  const {
    enabled = true,
    breakpoint = DEFAULT_MOBILE_BREAKPOINT,
    tabletBreakpoint = DEFAULT_TABLET_BREAKPOINT,
  } = options;

  const [screenWidth, setScreenWidth] = React.useState<number | undefined>(
    undefined
  );
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  const updateDeviceType = React.useCallback(
    (width: number) => {
      const mobile = width < breakpoint;
      const tablet = width >= breakpoint && width < tabletBreakpoint;
      const desktop = width >= tabletBreakpoint;

      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsDesktop(desktop);
      setScreenWidth(width);
    },
    [breakpoint, tabletBreakpoint]
  );

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const initialWidth = globalThis.innerWidth;
    updateDeviceType(initialWidth);

    const mobileQuery = globalThis.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const tabletQuery = globalThis.matchMedia(
      `(min-width: ${breakpoint}px) and (max-width: ${tabletBreakpoint - 1}px)`
    );
    const desktopQuery = globalThis.matchMedia(
      `(min-width: ${tabletBreakpoint}px)`
    );

    const handleResize = () => {
      updateDeviceType(globalThis.innerWidth);
    };

    globalThis.addEventListener("resize", handleResize);

    const handleMobileChange = () => {
      if (mobileQuery.matches) {
        updateDeviceType(globalThis.innerWidth);
      }
    };

    const handleTabletChange = () => {
      if (tabletQuery.matches) {
        updateDeviceType(globalThis.innerWidth);
      }
    };

    const handleDesktopChange = () => {
      if (desktopQuery.matches) {
        updateDeviceType(globalThis.innerWidth);
      }
    };

    mobileQuery.addEventListener("change", handleMobileChange);
    tabletQuery.addEventListener("change", handleTabletChange);
    desktopQuery.addEventListener("change", handleDesktopChange);

    return () => {
      globalThis.removeEventListener("resize", handleResize);
      mobileQuery.removeEventListener("change", handleMobileChange);
      tabletQuery.removeEventListener("change", handleTabletChange);
      desktopQuery.removeEventListener("change", handleDesktopChange);
    };
  }, [breakpoint, enabled, tabletBreakpoint, updateDeviceType]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    tabletBreakpoint,
    screenWidth,
  };
}
