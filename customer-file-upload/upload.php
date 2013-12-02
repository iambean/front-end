

<?php
	//var_dump($_FILES);
	$pic = $_FILES['pic'];
	if($pic['error'] > 0){
		echo "<h1>上传出错</h1>";
	}else{
		$size_kb = $pic['size']>>10;
		echo <<<EOD
			<h1>上传成功！</h1>
			<p>文件名：{$pic['name']}</p>
			<p>文件大小：{$size_kb}Kb </p>
			<p>文件类型：{$pic['type']}</p>
			<p>服务端临时存储目录：{$pic['tmp_name']}</p>
EOD;
	}
?>