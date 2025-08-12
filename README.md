# CIRCUIT MAKER

## STRUCTURE OF COMPONENT(s) (Model):
Button { Highlight(Highlight), ClickDetector(clickdetector), Base(part), Out(part) }
- change hightlight outline transparency to 0 when button/switch is activated

Switch { Highlight(Highlight), ClickDetector(clickdetector), Base(part), Out(part) }
- change hightlight outline transparency to 0 when button/switch is activated

And { In1(part), In2(part), Base(part), Out(part) }

Light { In1 (part), Base(part), PointLight(PointLight) }
- set base pointlight brightness to 0, upon being activated should have 10 brightness

Not { In1 (part), Base(part), Out(part) }

## how do we do this?
the part take the in, handle the input(s), output to the out part