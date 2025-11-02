import { useState, useCallback, useMemo, useEffect } from "react";
import { FamilyMember, familyTreeData } from "@/data/familyData";
import { FamilyNode } from "./FamilyNode";
import { SearchBar } from "./SearchBar";
import { Button } from "@/components/ui/button";
import { Minimize2, Home } from "lucide-react";

// Utility function to find a member by name in the tree
const findMemberByName = (
  tree: FamilyMember,
  targetName: string
): FamilyMember | null => {
  if (tree.name.toLowerCase() === targetName.toLowerCase()) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const result = findMemberByName(child, targetName);
      if (result) return result;
    }
  }

  return null;
};

export const FamilyTree = () => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set([familyTreeData.name])
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedName, setHighlightedName] = useState("");
  const [currentView, setCurrentView] = useState<"main" | string>("main");

  // Get current tree based on view
  const currentTree = useMemo(() => {
    if (currentView === "main") {
      return familyTreeData;
    }
    return findMemberByName(familyTreeData, currentView) || familyTreeData;
  }, [currentView]);

  // Reset expanded nodes when changing views
  useEffect(() => {
    setExpandedNodes(new Set([currentTree.name]));
    setSearchTerm("");
    setHighlightedName("");
  }, [currentView, currentTree.name]);

  // Find all matches recursively
  const findMatches = useCallback(
    (member: FamilyMember, term: string): string[] => {
      const matches: string[] = [];
      const lowerTerm = term.toLowerCase();
      const lowerName = member.name.toLowerCase();

      if (lowerName.includes(lowerTerm)) {
        matches.push(member.name);
      }

      if (member.children) {
        member.children.forEach((child) => {
          matches.push(...findMatches(child, term));
        });
      }

      return matches;
    },
    []
  );

  // Get path to a specific member (for auto-expanding ancestors)
  const getPathToMember = useCallback(
    (
      member: FamilyMember,
      targetName: string,
      path: string[] = []
    ): string[] | null => {
      if (member.name.toLowerCase() === targetName.toLowerCase()) {
        return path;
      }

      if (member.children) {
        for (const child of member.children) {
          const childPath = getPathToMember(child, targetName, [
            ...path,
            member.name,
          ]);
          if (childPath) return childPath;
        }
      }

      return null;
    },
    []
  );

  // Search functionality with auto-expand
  useEffect(() => {
    if (!searchTerm) {
      setHighlightedName("");
      return;
    }

    const matches = findMatches(currentTree, searchTerm);

    if (matches.length > 0) {
      const firstMatch = matches[0];
      setHighlightedName(firstMatch);

      // Auto-expand path to first match
      const path = getPathToMember(currentTree, firstMatch);
      if (path) {
        setExpandedNodes(new Set([currentTree.name, ...path, firstMatch]));
      }
    } else {
      setHighlightedName("");
    }
  }, [searchTerm, findMatches, getPathToMember, currentTree]);

  // Memoize search results count
  const searchResultsCount = useMemo(() => {
    if (!searchTerm) return 0;
    return findMatches(currentTree, searchTerm).length;
  }, [searchTerm, findMatches, currentTree]);

  // Toggle expansion - only one generation at a time
  const handleToggle = useCallback(
    (name: string) => {
      setExpandedNodes((prev) => {
        const next = new Set(prev);

        if (next.has(name)) {
          // Collapse this node and all descendants
          const collapseDescendants = (member: FamilyMember) => {
            next.delete(member.name);
            if (member.children) {
              member.children.forEach(collapseDescendants);
            }
          };

          const findAndCollapse = (member: FamilyMember) => {
            if (member.name === name) {
              collapseDescendants(member);
              return true;
            }
            if (member.children) {
              return member.children.some(findAndCollapse);
            }
            return false;
          };

          findAndCollapse(currentTree);
        } else {
          // Expand this node
          next.add(name);
        }

        return next;
      });
    },
    [currentTree]
  );

  const handleNodeClick = useCallback((name: string) => {
    setHighlightedName(name);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set([currentTree.name]));
    setSearchTerm("");
    setHighlightedName("");
  }, [currentTree.name]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setHighlightedName("");
  }, []);

  const handleOpenSubtree = useCallback((name: string) => {
    setCurrentView(name);
  }, []);

  const handleBackToMain = useCallback(() => {
    setCurrentView("main");
  }, []);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {currentView === "main"
              ? "Family Tree"
              : `${currentTree.name}'s Family Tree`}
          </h1>
          <p className="text-muted-foreground">
            {currentView === "main"
              ? "Explore your family heritage and connections"
              : "Viewing subtree - Click home to return to full tree"}
          </p>
        </div>

        {/* Back Button */}
        {currentView !== "main" && (
          <div className="mb-4">
            <Button
              onClick={handleBackToMain}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Full Tree
            </Button>
          </div>
        )}

        {/* Search and Controls */}
        <div className="bg-card border-2 border-border rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={handleClearSearch}
                resultsCount={searchResultsCount}
              />
            </div>
            <Button
              onClick={handleCollapseAll}
              variant="outline"
              className="whitespace-nowrap h-12"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Collapse All
            </Button>
          </div>
        </div>

        {/* Tree */}
        <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm">
          <FamilyNode
            member={currentTree}
            level={0}
            isExpanded={expandedNodes.has(currentTree.name)}
            isHighlighted={
              highlightedName.toLowerCase() === currentTree.name.toLowerCase()
            }
            onToggle={handleToggle}
            expandedNodes={expandedNodes}
            highlightedName={highlightedName}
            onNodeClick={handleNodeClick}
            onOpenSubtree={handleOpenSubtree}
            showSubtreeButton={currentView === "main"}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Tap any name to highlight • Tap names with arrows to expand
            {currentView === "main" &&
              " • Click the external link icon to open subtree"}
          </p>
        </div>
      </div>
    </div>
  );
};
