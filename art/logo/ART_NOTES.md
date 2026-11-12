# Crescent-cell mark

The icon is an original Blender model of a red, flattened, curved erythrocyte with tapered ends. The silhouette is simplified to stay legible as an application icon. It is not a calibrated reconstruction of a particular cell or a medical simulation.

## Reference observations

- [Cell Image Library, CIL:39075](https://www.cellimagelibrary.org/images/39075): scanning electron micrograph with a rounded, discoid normal erythrocyte in the background and a flattened, elongated sickled cell with tapered ends in the foreground. Its displayed red and tan colours are artificial colourization. The photograph was inspected as a morphology reference; its pixels are not used in the icon or redistributed here.
- [NHLBI: Sickle Cell Genetics and Pathophysiology](https://www.nhlbi.nih.gov/science/sickle-cell-genetics-and-pathophysiology): electron-microscopy panels document cellular ultrastructure. These panels are less suitable than the CIL view for evaluating a complete cell silhouette.

The model uses a curved axis and flattened elliptical cross-sections, with subtle irregularity rather than a spherical or annular body. Procedural microtexture, small geometric displacement and subsurface scattering describe its surface. Studio lighting is artistic; electron-microscopy surface contrast does not determine the optical appearance of a living cell.

## Source and outputs

- `build_logo.py`: reproducible Blender scene and renders.
- `crescent-cell.blend`: editable mesh, procedural material, lights and square camera.
- `preview-dark.png`: actual studio render on a dark teal background.
- `../../apps/web/assets/icon.png`: native transparent-background RGBA render.
- `export_icon.py`: conversion into a multi-resolution Windows ICO.
- `icon-validation.json`: image dimensions, alpha bounds, icon sizes and output hashes.

The background is rendered transparent directly in Blender. No chroma key or photographic reference is embedded in the icon.
