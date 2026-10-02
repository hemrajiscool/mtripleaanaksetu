import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getDocumentGraph } from '../services/api';
import type { DependencyAlert } from '../types';
import { GitGraph, AlertCircle, AlertTriangle } from 'lucide-react';

interface DependencyGraphProps {
  documentId: string;
  alerts?: DependencyAlert[];
  onOpenStandardDetail: (isNumber: string) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  documentId,
  alerts = [],
  onOpenStandardDetail,
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocumentGraph(documentId, 2);

      // Compute deterministic topological layout
      // Roots placed at top (y=60), intermediate at (y=200), leaves at (y=340)
      const rawNodes = data.nodes || [];
      const nodeCount = rawNodes.length;

      const formattedNodes: Node[] = rawNodes.map((n, idx) => {
        const isWithdrawn = n.data?.status === 'WITHDRAWN';
        const isSuper = n.data?.status === 'SUPERSEDED';

        let borderColor = '#2563eb';
        let bgColor = '#eff6ff';
        let textColor = '#1e3a8a';

        if (isWithdrawn) {
          borderColor = '#dc2626';
          bgColor = '#fef2f2';
          textColor = '#991b1b';
        } else if (isSuper) {
          borderColor = '#d97706';
          bgColor = '#fffbeb';
          textColor = '#92400e';
        } else if (n.data?.status === 'ACTIVE') {
          borderColor = '#059669';
          bgColor = '#ecfdf5';
          textColor = '#065f46';
        }

        // Deterministic grid coordinates
        const spacingX = Math.max(220, 700 / Math.max(1, nodeCount));
        const posX = 80 + idx * spacingX;
        const posY = n.data?.status === 'WITHDRAWN' ? 240 : n.data?.status === 'SUPERSEDED' ? 150 : 60;

        return {
          id: n.id,
          position: { x: posX, y: posY },
          data: {
            label: (
              <div
                className="cursor-pointer font-mono text-center p-2"
                onClick={() => onOpenStandardDetail(n.id)}
              >
                <div className="font-bold text-xs">{n.id}</div>
                <div className="text-[10px] opacity-90 font-sans uppercase font-semibold mt-0.5">
                  {n.data?.status || 'STANDARD'}
                </div>
              </div>
            ),
          },
          style: {
            background: bgColor,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '6px',
            color: textColor,
            padding: '6px 10px',
            minWidth: '150px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        };
      });

      // Transform edges
      const formattedEdges: Edge[] = (data.edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        animated: e.label === 'SUPERSEDED_BY' || e.animated,
        style: {
          stroke: e.label === 'SUPERSEDED_BY' ? '#dc2626' : '#94a3b8',
          strokeWidth: e.label === 'SUPERSEDED_BY' ? 2 : 1.5,
        },
        labelStyle: {
          fill: e.label === 'SUPERSEDED_BY' ? '#991b1b' : '#475569',
          fontSize: 10,
          fontFamily: 'monospace',
          fontWeight: 600,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: e.label === 'SUPERSEDED_BY' ? '#dc2626' : '#94a3b8',
        },
      }));

      setNodes(formattedNodes);
      setEdges(formattedEdges);
    } catch (err: any) {
      setError(err.message || 'Failed to render normative graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      loadGraph();
    }
  }, [documentId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-2xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-800 border-t-transparent mb-3" />
        <p className="text-xs text-slate-500 font-mono">Resolving 2-Hop Normative Reference Graph...</p>
      </div>
    );
  }

  if (error || nodes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-2xs">
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-900 font-mono">Normative Graph Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 font-sans">
          {error || 'No normative reference edges found for this document.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cascading Obsolescence Alert Banner */}
      {alerts && alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <span>CASCADING NORMATIVE OBSOLESCENCE ALERT ({alerts.length} DETECTED)</span>
          </div>
          <div className="space-y-1.5">
            {alerts.map((alert, i) => (
              <div key={i} className="text-xs text-amber-800 font-sans flex items-start justify-between gap-2 bg-white/70 p-2.5 rounded border border-amber-200">
                <div>
                  <strong className="font-mono font-bold">{alert.parent_is}</strong> normatively cites superseded{' '}
                  <strong className="font-mono text-red-700">{alert.obsolete_sub_ref}</strong> ({alert.sub_ref_status}).
                  <div className="text-[11px] text-amber-700 mt-0.5 italic">{alert.engineering_risk}</div>
                </div>
                <button
                  onClick={() => onOpenStandardDetail(alert.parent_is)}
                  className="text-[10px] font-mono text-blue-700 hover:text-blue-900 underline whitespace-nowrap cursor-pointer"
                >
                  Inspect Parent IS
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Canvas Card */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <GitGraph className="h-4 w-4 text-slate-700" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Normative Reference & Superseding Directed Acyclic Graph (2-Hop)
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-600">
            <span className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>ACTIVE ROOT</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
              <span>WITHDRAWN</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <span>SUPERSEDED</span>
            </span>
          </div>
        </div>

        <div style={{ height: '480px', width: '100%' }}>
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background color="#e2e8f0" gap={16} size={1} />
            <Controls className="bg-white border border-slate-200 text-slate-700 shadow-2xs" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};
