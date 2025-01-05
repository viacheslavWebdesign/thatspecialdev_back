<!doctype html>
<html <?php language_attributes(); ?>>

<head>
   <meta charset="<?php bloginfo( 'charset' ); ?>">
   <meta name="viewport" content="width=device-width, initial-scale=1">

   <?php wp_head(); ?>
</head>

<body style="background: black; width: 100%; margin: 0; padding: 0;">

   <h1
      style="margin: 0; position: fixed; transform: translate(-50%,-50%); top: 50%; left: 50%; z-index: 1; color: white; font-family: TimesNewRoman,Times New Roman,Times,Baskerville,Georgia,serif; font-size: 3rem; letter-spacing: 0.2em;">
      headless</h1>
   <img src="<?php echo get_template_directory_uri() ?>/placeholder.gif"
      style="margin: 0; display: block; width: 100%; max-width: 512px; height: auto; position: fixed; transform: translate(-50%,-50%); top: 50%; left: 50%;">

</body>

</html>