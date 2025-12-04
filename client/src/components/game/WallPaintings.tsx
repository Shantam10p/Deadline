import * as THREE from "three";
import { Suspense, useEffect, useState } from "react";
import { useGameState } from "@/lib/stores/useGameState";

function useResizedTexture(imagePath: string, maxDim: number = 1024) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = imagePath;
    img.onload = () => {
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      w = Math.max(1, 1 << Math.floor(Math.log2(w * scale)));
      h = Math.max(1, 1 << Math.floor(Math.log2(h * scale)));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 2;
        tex.generateMipmaps = true;
        tex.needsUpdate = true;
        if (!cancelled) setTexture(tex);
      }
    };
    img.onerror = () => {
      // Fallback: load original texture via TextureLoader
      const loader = new THREE.TextureLoader();
      loader.load(
        imagePath,
        (tex) => {
          if (cancelled) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.flipY = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.anisotropy = 2;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
          setTexture(tex);
        },
        undefined,
        () => {
          if (!cancelled) setTexture(null);
        }
      );
    };
    return () => {
      cancelled = true;
    };
  }, [imagePath, maxDim]);
  return texture;
}

function SinglePainting({
  imagePath,
  position,
  rotation,
  size,
}: {
  imagePath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}) {
  const texture = useResizedTexture(imagePath, 768);
  return (
    <group position={position} rotation={rotation}>
      <mesh frustumCulled={false}>
        <boxGeometry args={[size[0] + 0.15, size[1] + 0.15, 0.08]} />
        <meshBasicMaterial color="#1a1a1a" fog={false} />
      </mesh>
      {texture && (
        <mesh position={[0, 0, 0.12]} frustumCulled={false} renderOrder={10}>
          <planeGeometry args={size} />
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            side={THREE.DoubleSide}
            depthWrite={true}
            depthTest={false}
            fog={false}
            polygonOffset={true}
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-1}
          />
        </mesh>
      )}
    </group>
  );
}

function PaintingsContent() {
  const shrinkFactor = useGameState((s) => s.roomShrinkFactor);
  const BASE_ROOM_SIZE = 40; // must match DormRoom
  const half = (BASE_ROOM_SIZE * shrinkFactor) / 2;
  const wallOffset = 0.15; // Small offset from wall surface
  const y = 2.5;
  const size: [number, number] = [2, 2.5];

  // Even spacing along walls - divide wall into equal segments
  const usableWidth = half - 4; // Leave margin from corners
  const positions4 = [-0.75, -0.25, 0.25, 0.75].map((t) => t * usableWidth);
  const positions2 = [-0.5, 0.5].map((t) => t * usableWidth);

  const paintings = [
    // Back wall (North, Z = -half + wallOffset, faces +Z into room) - Reduced to 3 paintings to avoid bed
    { imagePath: "/img1.png",  position: [positions4[0], y, -(half - wallOffset)] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], size },
    { imagePath: "/img3.jpg",  position: [positions4[2], y, -(half - wallOffset)] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], size },
    { imagePath: "/img4.png",  position: [positions4[3], y, -(half - wallOffset)] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], size },

    // Left wall (West, X = -half + wallOffset, faces +X into room)
    { imagePath: "/img6.png",  position: [-(half - wallOffset), y, positions4[0]] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], size },
    { imagePath: "/img7.png",  position: [-(half - wallOffset), y, positions4[1]] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], size },
    { imagePath: "/img8.png",  position: [-(half - wallOffset), y, positions4[2]] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], size },
    { imagePath: "/img9.png",  position: [-(half - wallOffset), y, positions4[3]] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], size },

    // Right wall (East, X = +half - wallOffset, faces -X into room)
    { imagePath: "/img10.png", position: [ (half - wallOffset), y, positions4[0]] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number], size },
    { imagePath: "/img11.jpg", position: [ (half - wallOffset), y, positions4[1]] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number], size },
    { imagePath: "/img12.png", position: [ (half - wallOffset), y, positions4[2]] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number], size },
    { imagePath: "/img2.jpg",  position: [ (half - wallOffset), y, positions4[3]] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number], size },

    // Front wall (South, Z = +half - wallOffset, faces -Z into room)
    { imagePath: "/img13.jpeg", position: [positions2[0], y,  (half - wallOffset)] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], size },
    { imagePath: "/img14.jpeg", position: [positions2[1], y,  (half - wallOffset)] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], size },
  ];

  return (
    <group>
      {paintings.map((p, i) => (
        <SinglePainting
          key={i}
          imagePath={p.imagePath}
          position={p.position}
          rotation={p.rotation}
          size={p.size}
        />
      ))}
    </group>
  );
}

export function WallPaintings() {
  return (
    <Suspense fallback={null}>
      <PaintingsContent />
    </Suspense>
  );
}
