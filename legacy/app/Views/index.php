<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>File Upload</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      .container { max-width: 750px }
    </style>
</head>
<body>
    <div class="container mt-5">
        <form method="post" id="upload_image_form" enctype="multipart/form-data">
            <div id="alertMessage" class="alert alert-warning mb-3" style="display: none">
                <span id="alertMsg"></span>
            </div>
            <div class="d-grid text-center">
               <img class="mb-3" id="ajaxImgUpload" alt="Preview Image" src="https://via.placeholder.com/300" />
            </div>
            <div class="mb-3">
                <input type="file" name="file" multiple="true" id="finput" onchange="onFileUpload(this);"
                    class="form-control form-control-lg"  accept="image/*">
            </div>
            <div class="d-grid">
               <button type="submit" class="btn btn-danger uploadBtn">Upload</button>
            </div>
        </form>
    </div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script>
        function onFileUpload(input, id) {
            id = id || '#ajaxImgUpload';
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $(id).attr('src', e.target.result).width(300)
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
        $(document).ready(function () {
            $('#upload_image_form').on('submit', function (e) {
                $('.uploadBtn').html('Uploading ...');
                $('.uploadBtn').prop('Disabled');
                e.preventDefault();
                if ($('#file').val() == '') {
                    alert("Choose File");
                    $('.uploadBtn').html('Upload');
                    $('.uploadBtn').prop('enabled');
                    document.getElementById("upload_image_form").reset();
                } else {
                    $.ajax({
                        url: "<?php echo base_url(); ?>/AjaxFileUpload/upload",
                        method: "POST",
                        data: new FormData(this),
                        processData: false,
                        contentType: false,
                        cache: false,
                        dataType: "json",
                        success: function (res) {
                            console.log(res.success);
                            if (res.success == true) {
                                $('#ajaxImgUpload').attr('src', 'https://via.placeholder.com/300');
                                $('#alertMsg').html(res.msg);
                                $('#alertMessage').show();
                            } else if (res.success == false) {
                                $('#alertMsg').html(res.msg);
                                $('#alertMessage').show();
                            }
                            setTimeout(function () {
                                $('#alertMsg').html('');
                                $('#alertMessage').hide();
                            }, 4000);
                            $('.uploadBtn').html('Upload');
                            $('.uploadBtn').prop('Enabled');
                            document.getElementById("upload_image_form").reset();
                        }
                    });
                }
            });
        });
    </script>
</body>
</html>