import { memo, useMemo } from "react";
import { ChevronDown, ChevronRight, Users, ExternalLink } from "lucide-react";
import { FamilyMember } from "@/data/familyData";
import { cn } from "@/lib/utils";

interface FamilyNodeProps {
  member: FamilyMember;
  level: number;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: (name: string) => void;
  expandedNodes: Set<string>;
  highlightedName: string;
  onNodeClick: (name: string) => void;
  onOpenSubtree: (name: string) => void;
  showSubtreeButton?: boolean;
}

export const FamilyNode = memo(
  ({
    member,
    level,
    isExpanded,
    isHighlighted,
    onToggle,
    expandedNodes,
    highlightedName,
    onNodeClick,
    onOpenSubtree,
    showSubtreeButton = true,
  }: FamilyNodeProps) => {
    const hasChildren = member.children && member.children.length > 0;

    const handleClick = () => {
      if (hasChildren) {
        onToggle(member.name);
      }
      onNodeClick(member.name);
    };

    const handleOpenSubtree = (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenSubtree(member.name);
    };

    const childrenNodes = useMemo(() => {
      if (!isExpanded || !member.children) return null;

      return member.children.map((child) => (
        <FamilyNode
          key={child.name}
          member={child}
          level={level + 1}
          isExpanded={expandedNodes.has(child.name)}
          isHighlighted={
            highlightedName.toLowerCase() === child.name.toLowerCase()
          }
          onToggle={onToggle}
          expandedNodes={expandedNodes}
          highlightedName={highlightedName}
          onNodeClick={onNodeClick}
          onOpenSubtree={onOpenSubtree}
          showSubtreeButton={showSubtreeButton}
        />
      ));
    }, [
      isExpanded,
      member.children,
      level,
      expandedNodes,
      highlightedName,
      onToggle,
      onNodeClick,
      onOpenSubtree,
      showSubtreeButton,
    ]);

    return (
      <div className="family-node">
        {level > 0 && <div className="ml-4 border-l-2 border-tree-line h-6" />}

        <div
          className={cn(
            "group relative ml-4 mb-3 transition-all duration-300",
            level > 0 && "ml-8"
          )}
        >
          {level > 0 && (
            <div className="absolute -left-4 top-1/2 w-4 border-t-2 border-tree-line" />
          )}

          <button
            onClick={handleClick}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border-2",
              "hover:shadow-md active:scale-[0.98]",
              hasChildren ? "cursor-pointer" : "cursor-default",

              // Base
              "bg-card border-border",

              // Highlighted node (clicked/current node)
              isHighlighted &&
                "bg-blue-200 border-blue-500 text-blue-900 shadow-lg scale-[1.03]",

              // Expanded node (open generation)
              isExpanded &&
                !isHighlighted &&
                "bg-green-100 border-green-500 text-green-900 shadow-md",

              // Root styling
              level === 0 && "text-lg font-bold text-primary"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {hasChildren && (
                  <div className="flex-shrink-0 text-primary">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                )}
                {!hasChildren && level > 0 && (
                  <div className="flex-shrink-0 text-muted-foreground">
                    <Users className="w-4 h-4" />
                  </div>
                )}
                <span
                  className={cn(
                    "font-medium text-foreground break-words text-sm",
                    level === 0 && "text-base font-bold text-primary",
                    isHighlighted && "font-semibold"
                  )}
                >
                  {member.name}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {hasChildren && (
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {member.children!.length}
                  </span>
                )}
                {showSubtreeButton && hasChildren && (
                  <button
                    onClick={handleOpenSubtree}
                    className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                    title="Open subtree in new view"
                  >
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </button>
                )}
              </div>
            </div>
          </button>
        </div>

        {hasChildren && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="ml-4">{childrenNodes}</div>
          </div>
        )}
      </div>
    );
  }
);

FamilyNode.displayName = "FamilyNode";
