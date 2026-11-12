"""Rebuild the red crescent-cell application icon in Blender.

Run from any working directory with Blender --background --python-exit-code 1
--python art/logo/build_logo.py. Outputs are relative to this source file.
The red material and crescent shape are an application mark inspired by sickled
erythrocytes, not a medical simulation or a direct reconstruction of a specimen.
"""
from pathlib import Path
import json
import math

import bpy
from mathutils import Vector, noise

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUTPUT = ROOT / "apps" / "desktop" / "assets"
HERE.mkdir(parents=True, exist_ok=True)
OUTPUT.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"
scene.view_settings.view_transform = "AgX"

# A flattened, tapered, continuous organic membrane around a curved axis.
# Radial cross-sections retain a closed volume and taper into rounded tips.
segments, rings = 240, 80
vertices, faces = [], []
for i in range(segments + 1):
    u = i / segments
    angle = math.radians(-73 + 146 * u)
    taper = math.sin(math.pi * u) ** 0.68
    radius = 1.45 + 0.035 * math.sin(angle * 3.0)
    center = Vector((-radius * math.cos(angle), radius * math.sin(angle), 0.0))
    outward = Vector((-math.cos(angle), math.sin(angle), 0.0))
    width = 0.025 + 0.40 * taper
    depth = 0.012 + 0.135 * taper
    for j in range(rings):
        phi = 2 * math.pi * j / rings
        p = center + outward * (width * math.cos(phi))
        p.z += depth * math.sin(phi)
        # Low-amplitude displacement supplies actual membrane irregularity.
        normal = (outward * math.cos(phi) + Vector((0, 0, math.sin(phi)))).normalized()
        texture = noise.fractal(p * 18.0, 1.0, 2.0, 3)
        p += normal * texture * 0.007 * taper
        vertices.append(tuple(p))
for i in range(segments):
    for j in range(rings):
        a = i * rings + j
        b = i * rings + (j + 1) % rings
        faces.append((a, b, b + rings, a + rings))
faces.append(tuple(reversed(range(rings))))
faces.append(tuple(segments * rings + j for j in range(rings)))
mesh = bpy.data.meshes.new("CrescentCell_Membrane")
mesh.from_pydata(vertices, [], faces)
mesh.update()
cell = bpy.data.objects.new("CrescentCell", mesh)
scene.collection.objects.link(cell)
cell.rotation_euler = (math.radians(-7), math.radians(13), math.radians(-22))
for polygon in mesh.polygons:
    polygon.use_smooth = True
subdivision = cell.modifiers.new("Membrane smoothing", "SUBSURF")
subdivision.levels = 1
subdivision.render_levels = 1

material = bpy.data.materials.new("Red erythrocyte membrane")
material.use_nodes = True
nodes = material.node_tree.nodes
links = material.node_tree.links
shader = nodes.get("Principled BSDF")
shader.inputs["Base Color"].default_value = (0.34, 0.012, 0.019, 1)
shader.inputs["Roughness"].default_value = 0.39
shader.inputs["Subsurface Weight"].default_value = 0.18
shader.inputs["Subsurface Radius"].default_value = (1.0, 0.5, 0.3)
shader.inputs["Subsurface Scale"].default_value = 0.08
shader.inputs["Coat Weight"].default_value = 0.08
coordinate = nodes.new("ShaderNodeTexCoord")
fine = nodes.new("ShaderNodeTexNoise")
fine.inputs["Scale"].default_value = 125
fine.inputs["Detail"].default_value = 3.0
fine.inputs["Roughness"].default_value = 0.72
links.new(coordinate.outputs["Generated"], fine.inputs["Vector"])
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.24
bump.inputs["Distance"].default_value = 0.027
links.new(fine.outputs["Fac"], bump.inputs["Height"])
links.new(bump.outputs["Normal"], shader.inputs["Normal"])
variation = nodes.new("ShaderNodeTexNoise")
variation.inputs["Scale"].default_value = 4.0
variation.inputs["Detail"].default_value = 2.5
links.new(coordinate.outputs["Generated"], variation.inputs["Vector"])
ramp = nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.2
ramp.color_ramp.elements[0].color = (0.19, 0.003, 0.009, 1)
ramp.color_ramp.elements[1].position = 0.8
ramp.color_ramp.elements[1].color = (0.47, 0.018, 0.025, 1)
links.new(variation.outputs["Fac"], ramp.inputs["Fac"])
links.new(ramp.outputs["Color"], shader.inputs["Base Color"])
cell.data.materials.append(material)

def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()

def area(name, position, energy, size, color, target=(-0.5, 0, 0)):
    data = bpy.data.lights.new(name, "AREA")
    data.energy, data.shape, data.size, data.color = energy, "DISK", size, color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = position
    aim(obj, target)
    return obj

area("Large warm key", (-3.2, -3.4, 5.3), 420, 4.2, (1.0, 0.90, 0.80))
area("Cool edge", (3.1, 2.2, 2.8), 330, 3.0, (0.57, 0.80, 1.0))
area("Soft fill", (-1.0, 3.4, 5.0), 160, 4.0, (0.88, 0.96, 1.0))
area("Lower volume", (0.5, -3.0, -1.5), 40, 3.0, (0.72, 0.84, 1.0))

world = bpy.data.worlds.new("Dark teal studio")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.008, 0.017, 0.025, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.3
scene.world = world

camera_data = bpy.data.cameras.new("Square icon camera")
camera = bpy.data.objects.new("Square icon camera", camera_data)
scene.collection.objects.link(camera)
camera.location = (-0.15, -3.1, 8.0)
target = (-1.02, 0, 0)
aim(camera, target)
camera_data.type = "ORTHO"
camera_data.ortho_scale = 3.35
scene.camera = camera

# Fit and center the actual rotated membrane in camera space, with a safe margin.
bpy.context.view_layer.update()
inverse_camera = camera.matrix_world.inverted()
camera_points = [inverse_camera @ (cell.matrix_world @ vertex.co) for vertex in mesh.vertices]
min_x, max_x = min(p.x for p in camera_points), max(p.x for p in camera_points)
min_y, max_y = min(p.y for p in camera_points), max(p.y for p in camera_points)
orientation = camera.matrix_world.to_quaternion()
camera.location += orientation @ Vector(((min_x + max_x) / 2, (min_y + max_y) / 2, 0))
camera_data.ortho_scale = max(max_x - min_x, max_y - min_y) / 0.86

# Center the source viewport on the asset when it is opened interactively.
bpy.context.view_layer.objects.active = cell
cell.select_set(True)
scene.render.film_transparent = True
scene.render.filepath = "//../../apps/desktop/assets/icon.png"
bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "crescent-cell.blend"))
bpy.ops.render.render(write_still=True)

# Keep a genuine studio render alongside the transparent icon.
scene.render.film_transparent = False
scene.render.filepath = str(HERE / "preview-dark.png")
bpy.ops.render.render(write_still=True)

manifest = {
    "source": "crescent-cell.blend",
    "generator": "build_logo.py",
    "renderer": bpy.app.version_string,
    "resolution": [1024, 1024],
    "transparent_icon": "../../apps/desktop/assets/icon.png",
    "preview": "preview-dark.png",
    "style": "Red stylized crescent-shaped erythrocyte application mark",
    "medical_simulation": False,
}
(HERE / "render-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
